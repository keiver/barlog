import {Tabs} from "expo-router"
import React from "react"

import {TabBarIcon} from "@/components/navigation/TabBarIcon"
import {Colors} from "@/constants/Colors"
import {useColorScheme} from "@/hooks/useColorScheme"

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Barbell",
          tabBarIcon: ({color, focused}) => <TabBarIcon name={focused ? "barbell-sharp" : "barbell-outline"} color={color} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({color, focused}) => <TabBarIcon name={focused ? "settings-sharp" : "settings-outline"} color={color} />
        }}
      />
    </Tabs>
  )
}
