import { Message } from "@/model/user";

export interface ApiResponse{
    success : boolean;
    message : string;
    isAcceptMessages?: boolean;
    messages?: Array<Message>;
}
