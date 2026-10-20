import { WatchStage } from './app/WatchStage'
import { SafeZone, WatchScreen } from './ui/WatchScreen'
import { WatchBezel } from './ui/WatchBezel'
import styles from './App.module.css'

export function App() {
  return (
    <WatchStage>
      <WatchBezel>
        <WatchScreen>
          <SafeZone>
            <h1 className={styles.brand}>Arco Fisio</h1>
          </SafeZone>
        </WatchScreen>
      </WatchBezel>
    </WatchStage>
  )
}
