import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";

import colors from "../../config/colors";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import StatsScreen from "../screens/StatsScreen";
import AddScreen from "../screens/AddScreen";
import BudgetAddScreen from "../screens/components/budget/BudgetAddScreen";
import { useTheme } from "../../config/theme/ThemeProvider";
import { useThemeColors } from "../../config/theme/colorMode";

interface MainTabNavigatorProps {
  user: User;
}

const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ user }) => {
  const { isLightMode } = useTheme();
  const { tabBarColor, tabBatInactiveColor, darksecondary } = useThemeColors();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.darkSecondary,
        tabBarInactiveTintColor: tabBatInactiveColor,
        tabBarStyle: {
          height: 60,
          backgroundColor: tabBarColor,
          borderRadius: 30,
          marginHorizontal: 8,
          marginVertical: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} user={user} />}
      </Tab.Screen>

      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-bar"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused, size }) => (
            <View
              style={{
                position: "absolute",
                top: -25,
                width: size * 1.7,
                height: size * 1.7,
                borderRadius: (size * 2.2) / 2,
                backgroundColor: focused
                  ? colors.secondary
                  : isLightMode
                  ? colors.brown
                  : colors.light,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="plus"
                color={
                  focused
                    ? colors.white
                    : isLightMode
                    ? colors.white
                    : colors.primary
                }
                size={size * 1.5}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetAddScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      >
        {(props) => <ProfileScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
