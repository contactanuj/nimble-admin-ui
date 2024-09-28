import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import OrderDetails from "../../components/Shop/OrderDetails";
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar';

const ShopOrderDetails = () => {
  return (
    <div>
         <DashboardHeader />
         <div className="flex justify-between w-full">
              <div className="w-[80px] 800px:w-[330px]">
                <DashboardSideBar active={2} />
              </div>
              <div className="w-full justify-center">
                  <OrderDetails />
              </div>
            </div>
    </div>
  )
}

export default ShopOrderDetails