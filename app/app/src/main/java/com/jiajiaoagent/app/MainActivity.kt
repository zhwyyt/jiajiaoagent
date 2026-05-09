package com.jiajiaoagent.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.navigation.compose.rememberNavController
import com.jiajiaoagent.app.navigation.AppNavGraph
import com.jiajiaoagent.app.ui.theme.JiajiaoAgentTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            JiajiaoAgentTheme {
                val navController = rememberNavController()
                AppNavGraph(navController)
            }
        }
    }
}
