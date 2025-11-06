import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { ChatOpenAI } from '@langchain/openai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MongoClient } from 'mongodb';
import { createAgent } from 'langchain';
import * as z from 'zod';
import { createGeneralAssistantTool } from '../../core/tools/ retriever.tool';
import {
  cancelInsurance,
  getInsurance,
  getInsuranceById,
  purchaseInsurance,
  renewInsurance,
} from '../../core/tools/policies.tools';
import { getAllPlans, getPlanById, getPlansByCategory } from '../../core/tools/plans.tools';
import { AGENT_MODEL, VECTOR_STORE, EMBEDDINGS } from './agent.constants';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [AgentController],
  providers: [
    {
      provide: EMBEDDINGS,
      useFactory: () => {
        return new OpenAIEmbeddings({
          apiKey: process.env.OPENAI_API_KEY,
          model: 'text-embedding-3-large',
        });
      },
    },
    {
      provide: VECTOR_STORE,
      useFactory: async (embeddings: OpenAIEmbeddings) => {
        const mongoClient = new MongoClient(process.env.MONGODB_ATLAS_URI!);
        await mongoClient.connect();

        const dbName = process.env.MONGODB_ATLAS_DB_NAME;
        const collectionName = process.env.MONGODB_ATLAS_COLLECTION_NAME;
        const db = mongoClient.db(dbName);
        const collection = db.collection(collectionName);

        const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
          collection: collection,
          indexName: 'vector_index',
          textKey: 'text',
          embeddingKey: 'embedding',
        });

        return vectorStore;
      },
      inject: [EMBEDDINGS],
    },
    {
      provide: AGENT_MODEL,
      useFactory: async (vectorStore: MongoDBAtlasVectorSearch) => {
        // Create model with system instruction to enforce tool-only responses
        const model = new ChatOpenAI({
          model: 'gpt-4o',
          temperature: 0,
          apiKey: process.env.OPENAI_API_KEY,
          // System message is also added in messages array, but this provides additional enforcement
        });

        const contextSchema = z.object({
          user_id: z.string().describe('The unique ID of the user.'),
          chat_id: z.string().optional().describe('The chat conversation ID.'),
        });

        // Return function that creates agent with userId
        return async (userId: string) => {
          const generalAssistantTool = await createGeneralAssistantTool(vectorStore, userId);

          return createAgent({
            model,
            tools: [
              // Policy tools
              purchaseInsurance,
              renewInsurance,
              cancelInsurance,
              getInsurance,
              getInsuranceById,
              // Plan tools
              getAllPlans,
              getPlanById,
              getPlansByCategory,
              // General assistant knowledge tool
              generalAssistantTool,
            ],
            contextSchema,
          });
        };
      },
      inject: [VECTOR_STORE],
    },
    AgentService,
  ],
  exports: [AgentService, VECTOR_STORE, EMBEDDINGS],
})
export class AgentModule {}
