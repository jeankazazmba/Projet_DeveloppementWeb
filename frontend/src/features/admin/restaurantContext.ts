import { createContext, useContext } from 'react'

export const RestaurantNameContext = createContext('Khalifa_food')
export const useAdminRestaurantName = () => useContext(RestaurantNameContext)
