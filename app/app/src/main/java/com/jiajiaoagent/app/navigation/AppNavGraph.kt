package com.jiajiaoagent.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.jiajiaoagent.app.ui.screens.ConversationScreen
import com.jiajiaoagent.app.ui.screens.GrowthScreen
import com.jiajiaoagent.app.ui.screens.HomeScreen
import com.jiajiaoagent.app.ui.screens.TrainingPlanScreen

@Composable
fun AppNavGraph(
    navController: NavHostController
) {
    NavHost(
        navController = navController,
        startDestination = AppDestination.Home.route
    ) {
        composable(AppDestination.Home.route) {
            HomeScreen(
                onStartPractice = { navController.navigate(AppDestination.Conversation.route) },
                onOpenPlan = { navController.navigate(AppDestination.Plan.route) },
                onOpenGrowth = { navController.navigate(AppDestination.Growth.route) }
            )
        }
        composable(AppDestination.Conversation.route) {
            ConversationScreen()
        }
        composable(AppDestination.Plan.route) {
            TrainingPlanScreen()
        }
        composable(AppDestination.Growth.route) {
            GrowthScreen()
        }
    }
}
