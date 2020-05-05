import { NuxtAxiosInstance } from "@nuxtjs/axios"
import { initializeAxios } from "~/utils/axios-accessor"

export class HttpError extends Error {
    constructor (err: any) {
        super()
        if (err.response) {
            this.status = err.response.status
            this.message = err.response.data
        } else {
            this.message = err.message
        }
    }

  public status = 0
  public message: string
}

export default function ({ $axios }: { $axios: NuxtAxiosInstance }) {
    initializeAxios($axios)
    $axios.onError((error) => {
        throw new HttpError(error)
    })
}
