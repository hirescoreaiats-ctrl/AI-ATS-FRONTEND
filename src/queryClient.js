import { QueryClient } from "@tanstack/react-query";
export const queryClient=new QueryClient({defaultOptions:{queries:{staleTime:30000,gcTime:600000,retry:1,refetchOnMount:true,refetchOnReconnect:true,refetchOnWindowFocus:true}}});
