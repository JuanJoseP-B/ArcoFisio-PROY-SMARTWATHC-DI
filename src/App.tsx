import { SensorProbe } from './app/SensorProbe'
import { WatchStage } from './app/WatchStage'
import { SafeZone, WatchScreen } from './ui/WatchScreen'
import { WatchBezel } from './ui/WatchBezel'
import styles from './App.module.css'

const probeRequested = (): boolean =>
  new URLSearchParams(window.location.search).get('probe') === '1'

export function App() {
  return (
    <WatchStage>
      <WatchBezel>
        <WatchScreen>
          <SafeZone>
            {probeRequested() ? <SensorProbe /> : <h1 className={styles.brand}>Arco Fisio</h1>}
          </SafeZone>
        </WatchScreen>
      </WatchBezel>
    </WatchStage>
  )
}
