import Loading from './Pages/loadingPage.jsx';
import { useAuth } from '@clerk/react';
import Layout from "./Components/Layout.jsx"
import Home from './Pages/Home.jsx';
import { Route,Routes,Navigate } from 'react-router';
import OrdersPage from './Pages/OrdersPage.jsx';
import CartPage from './Pages/CartPage.jsx';

function App() {
      const {isLoaded}=useAuth();
      if(!isLoaded) return <Loading/>;
  return (
     <Layout>
       <Routes>
         <Route path="/" element={<Home/>}/>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
       </Routes>
     </Layout>
  )
}

export default App