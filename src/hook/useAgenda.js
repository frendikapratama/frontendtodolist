import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getAgendasByKuarter
} from "../services/agenda";

export const useAgendabyKuarter = (kuarterId) => {
    const agendasByKuarter = useQuery({
        queryKey: ["agenda", kuarterId, "agendaByKuarter"],
        queryFn: () => getAgendasByKuarter(kuarterId),
        enabled: !!kuarterId,
        staleTime: 30000,
        refetchOnWindowFocus: false
    })
    return{
        agendasByKuarter
    }
}