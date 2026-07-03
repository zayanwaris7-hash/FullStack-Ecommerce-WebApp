import Loading from './Pages/loadingPage.jsx';
import { useAuth } from '@clerk/react';
import Layout from "./Components/Layout.jsx"

function App() {
      const {isLoaded}=useAuth();
      if(!isLoaded) return <Loading/>;
  return (
     <Layout>
       
     </Layout>
  )
}

export default App