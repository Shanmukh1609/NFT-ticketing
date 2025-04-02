import { PinataSDK } from "pinata"

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.VITE_PINATA_JWT}`,
  pinataGateway: `${process.env.VITE_GATEWAY_URL}`
})