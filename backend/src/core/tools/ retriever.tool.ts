// retriever.tool.ts
import { createRetrieverTool } from '@langchain/classic/tools/retriever';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import type { DynamicStructuredTool } from '@langchain/core/tools';

/**
 * Initialize user-specific retriever
 * Creates a vector store retriever filtered by userId using pre-initialized vector store
 */
export const initRetriever = async (vectorStore: MongoDBAtlasVectorSearch, userId: string) => {
  const retriever = vectorStore.asRetriever({
    filter: {
      preFilter: {
        userId: { $eq: userId },
      },
    },
    k: 10, // Return top 10 most relevant documents
  });

  return retriever;
};

/**
 * Creates a general assistant knowledge tool
 * This tool provides access to general knowledge base and user's uploaded PDF documents
 *
 * @param vectorStore - Pre-initialized MongoDB Atlas Vector Search instance
 * @param userId - The authenticated user's ID for filtering documents
 * @returns DynamicStructuredTool - LangChain general assistant tool
 */
export const createGeneralAssistantTool = async (
  vectorStore: MongoDBAtlasVectorSearch,
  userId: string,
): Promise<DynamicStructuredTool> => {
  const retriever = await initRetriever(vectorStore, userId);

  const tool = createRetrieverTool(retriever, {
    name: 'general_assistant_knowledge',
    description:
      'General assistant tool with comprehensive knowledge base and PDF document access. ' +
      'ALWAYS use this tool for any general query. This is the primary general assistant tool that should be used for general queries, ' +
      'questions about insurance concepts, or when users mention extracting data from PDFs. ' +
      "This tool can access both general knowledge about insurance policies and specific information from the user's uploaded PDF documents. " +
      'Use this when: the query is general in nature, users ask about insurance concepts, users want to extract information from their uploaded PDFs, ' +
      "or when other specific tools don't apply to the user's question. " +
      "Examples: 'What is health insurance?', 'Extract coverage details from my PDF', 'Tell me about life insurance plans', " +
      "'What does my policy document say about exclusions?'. " +
      "Searches through general knowledge base and user's uploaded insurance documents and PDFs. " +
      'IMPORTANT: If the related data is not present in the knowledge base or PDF documents, do not provide a generic response. ' +
      "Instead, reply with: 'There is no relevant data for what you asked.' " +
      'Only returns relevant information and document excerpts when data is found in the knowledge base or PDFs.',
  });

  return tool;
};
