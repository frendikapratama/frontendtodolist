import api from "../api/axios"

export async function getAgendasByKuarter(kuarterId){
    const res = await api.get(`/agenda/kuarter/${kuarterId}`)
    console.log(res.data.data)
    return res.data.data;
}