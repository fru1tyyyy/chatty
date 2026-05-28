export interface User {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    status: "online" | "offline" | "away";
    lastSeen?: string;
}

export interface Message {
    _id: string;
    conversation: string;
    sender: User;
    content: string;
    type: "text" | "image" | "file";
    readBy: string[];
    createdAt: string;
}

export interface Conversation {
    _id: string;
    participants: User[];
    isGroup: boolean;
    groupName?: string;
    groupAvatar?: string;
    lastMessage?: Message;
    lastMessageAt: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
}
