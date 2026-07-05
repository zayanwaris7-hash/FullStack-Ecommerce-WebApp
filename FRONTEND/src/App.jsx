import Loading from './Pages/loadingPage.jsx';
import { useAuth } from '@clerk/react';
import Layout from "./Components/Layout.jsx"
import Home from './Pages/Home.jsx';
import { Route,Routes,Navigate } from 'react-router';
import OrdersPage from './Pages/OrdersPage.jsx';
import CartPage from './Pages/CartPage.jsx';
import CheckoutReturnPage from './Pages/CheckOutReturnPages.jsx';
import OrderDetailPage from './Pages/OrderDetailPage.jsx';
import OrderSummaryPage from './Pages/OrderSummaryPage.jsx';
import OrderChatPage from './Pages/OrderChatPage.jsx';

function App() {
      const {isLoaded,isSignedIn}=useAuth();
      if(!isLoaded) return <Loading/>;
  return (
     <Layout>
       <Routes>
         <Route path="/" element={<Home/>}/>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={isSignedIn?<OrdersPage />: <Navigate to={"/"} replace/>} />
        <Route path="/checkout/return" element={<CheckoutReturnPage />} />
         <Route path="/orders/:id" element={<OrderDetailPage />}>
          <Route index element={<OrderSummaryPage />} />
          <Route path="chat" element={<OrderChatPage />} />
        </Route>
       </Routes>
     </Layout>
  )
}

export default App