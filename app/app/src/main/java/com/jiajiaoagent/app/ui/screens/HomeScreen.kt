package com.jiajiaoagent.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.jiajiaoagent.app.ui.viewmodel.HomeViewModel

private data class HomeAction(
    val title: String,
    val description: String,
    val onClick: () -> Unit
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onStartPractice: () -> Unit,
    onOpenPlan: () -> Unit,
    onOpenGrowth: () -> Unit,
    viewModel: HomeViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val actions = listOf(
        HomeAction("Start Today's Practice", "Begin a guided speaking session.", onStartPractice),
        HomeAction("Training Plan", "Review this week's speaking focus.", onOpenPlan),
        HomeAction("Growth Record", "See recent practice progress.", onOpenGrowth)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("JiajiaoAgent") }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Text(
                    text = uiState.headline,
                    style = MaterialTheme.typography.headlineSmall
                )
            }
            item {
                Text(
                    text = uiState.summary,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            items(actions) { action ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(action.title, style = MaterialTheme.typography.titleMedium)
                        Text(action.description, style = MaterialTheme.typography.bodyMedium)
                        Button(onClick = action.onClick) {
                            Text("Open")
                        }
                    }
                }
            }
        }
    }
}
