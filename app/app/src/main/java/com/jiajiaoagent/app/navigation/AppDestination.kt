package com.jiajiaoagent.app.navigation

enum class AppDestination(
    val route: String,
    val title: String
) {
    Home("home", "Home"),
    Conversation("conversation", "Conversation"),
    Plan("plan", "Training Plan"),
    Growth("growth", "Growth")
}
