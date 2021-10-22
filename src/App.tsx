import styles from './styles/app.module.scss'
import { LoginBox } from './components/LoginBox'
import { MessageList } from './components/MessageList'
import { AuthContext } from './contexts/auth'
import { useContext } from 'react'
import { SendMessageForm } from './components/SendMessageForm'

export function App() {
 
  const { user } = useContext(AuthContext)

  return (
    <div className={ `${styles.contentWrapper} ${!!user ? styles.contentSigned : ''}` }> 
      
      <MessageList />
      
      { !!user ? <SendMessageForm /> : <LoginBox />}
    
    </div>
  )
}

