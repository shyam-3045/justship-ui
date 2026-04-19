import api from "@/utils/axios"

export const getMe = async()=>
{
    const res = await api.get('/auth/me',{
        withCredentials:true
    })
    return res.data
}

