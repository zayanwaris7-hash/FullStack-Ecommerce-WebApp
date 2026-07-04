import Loading from './Pages/loadingPage.jsx';
import { useAuth } from '@clerk/react';
import Layout from "./Components/Layout.jsx"
import Home from './Pages/Home.jsx';
import { Route,Routes,Navigate } from 'react-router';
import Cart from './Pages/Cart.jsx';
import Orders from './Pages/Orders.jsx';

function App() {
      const {isLoaded}=useAuth();
      if(!isLoaded) return <Loading/>;
  return (
     <Layout>
       <Routes>
         <Route path='/' element={<Home/>}/>
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
       </Routes>
     </Layout>
  )
}

export default App