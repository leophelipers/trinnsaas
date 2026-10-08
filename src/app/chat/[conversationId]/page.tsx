import { Id } from "../../../../convex/_generated/dataModel";
import { ChatView } from "@/components/dashboard/chat/chat-view";

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params;

  return (
    <ChatView
      key={conversationId}
      conversationId={conversationId as Id<"aiConversations">}
    />
  );
}
