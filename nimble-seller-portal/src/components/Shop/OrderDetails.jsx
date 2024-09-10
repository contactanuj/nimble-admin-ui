import React, { useEffect, useState } from "react";
import styles from "../../styles/styles";
import { BsFillBagFill } from "react-icons/bs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import VerificationModal from "./VerificationModal"; // Import the modal component

const OrderDetails = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [status, setStatus] = useState("");
  const [action, setAction] = useState(""); // New state for tracking action
  const [modalOpen, setModalOpen] = useState(false); // State for modal visibility
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch]);

  const data = orders && orders.find((item) => item._id === id);

  const orderUpdateHandler = async (newStatus) => {
    await axios
      .put(
        `${server}/order/update-order-status/${id}`,
        { status: newStatus },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Order updated!");
        navigate("/dashboard-orders");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handleAction = (actionType) => {
    setAction(actionType);
    if (actionType === "Accept") {
      const nextStatus = "Preparing";
      orderUpdateHandler(nextStatus);
    } else if (actionType === "Reject") {
      const nextStatus = "Cancelled";
      orderUpdateHandler(nextStatus);
    } else if (actionType === "Modify") {
      const nextStatus = "Modification Requested";
      orderUpdateHandler(nextStatus);
    }
  };

  const handleStatusUpdate = () => {
    if (data?.status === "Ready for Pickup") {
      setModalOpen(true);
    } else {
      orderUpdateHandler(status);
    }
  };

  const stages = [
    "Pending",
    "Accepted",
    "Modification Requested",
    "Cancelled",
    "Preparing",
    "Ready for Pickup",
    "Delivered",
  ];

  const currentStatusIndex = stages.indexOf(data?.status);
  const nextStatus = stages[currentStatusIndex + 1];

  const isModificationPossible = data?.status === "Pending";

  return (
    <div className={`py-4 min-h-screen ${styles.section}`}>
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <BsFillBagFill size={30} color="crimson" />
          <h1 className="pl-2 text-[25px]">Order Details</h1>
        </div>
        <Link to="/dashboard-orders">
          <div className={`${styles.button} !bg-[#fce1e6] !rounded-[4px] text-[#e94560] font-[600] !h-[45px] text-[18px]`}>
            Order List
          </div>
        </Link>
      </div>

      <div className="w-full flex items-center justify-between pt-6">
        <h5 className="text-[#00000084]">
          Order ID: <span>#{data?._id?.slice(0, 8)}</span>
        </h5>
        <h5 className="text-[#00000084]">
          Placed on: <span>{data?.createdAt?.slice(0, 10)}</span>
        </h5>
      </div>

      <div className="w-full flex items-start mb-5">
        <img src={`${data?.cart[0]?.images[0]?.url}`} alt="" className="w-[80px] h-[80px]" />
        <div className="w-full">
          <h5 className="pl-3 text-[20px]">{data?.cart[0]?.name}</h5>
          <h5 className="pl-3 text-[20px] text-[#00000091]">
            US${data?.cart[0]?.discountPrice} x {data?.cart[0]?.qty}
          </h5>
        </div>
      </div>

      <div className="border-t w-full text-right">
        <h5 className="pt-3 text-[18px]">
          Total Price: <strong>US${data?.totalPrice}</strong>
        </h5>
      </div>

      <div className="w-full 800px:flex items-center">
        <div className="w-full 800px:w-[60%]">
          <h4 className="pt-3 text-[20px] font-[600]">Shipping Address:</h4>
          <h4 className="pt-3 text-[20px]">
            {data?.shippingAddress.address1} {data?.shippingAddress.address2}
          </h4>
          <h4 className="text-[20px]">{data?.shippingAddress.country}</h4>
          <h4 className="text-[20px]">{data?.shippingAddress.city}</h4>
          <h4 className="text-[20px]">{data?.user?.phoneNumber}</h4>
        </div>
        <div className="w-full 800px:w-[40%]">
          <h4 className="pt-3 text-[20px]">Payment Info:</h4>
          <h4>Status: {data?.paymentInfo?.status ? data?.paymentInfo?.status : "Not Paid"}</h4>
        </div>
      </div>

      {/* Add Premium Status, Order Code, and Collection Time */}
      <h4 className="pt-3 text-[20px] font-[600]">Premium Subscription:</h4>
      <h5 className="text-[18px]">{data?.isPremium ? "Premium" : "Normal"}</h5>

      <h4 className="pt-3 text-[20px] font-[600]">Collection Time:</h4>
      <h5 className="text-[18px]">{data?.selectedCollectionTime}</h5>

      <h4 className="pt-3 text-[20px] font-[600]">Order Code:</h4>
      <h5 className="text-[18px]">{data?.orderCode}</h5>

      <h4 className="pt-3 text-[20px] font-[600]">Order Status:</h4>

      <div className="flex items-center mt-5">
        <span className="mr-2 text-lg font-medium">Current Status: {data?.status}</span>
        {data?.status !== "Pending" && data?.status !== "Cancelled" && nextStatus && (
          <>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-[200px] border h-[35px] rounded-[5px] shadow-sm"
            >
              <option value="" disabled>
                Select next status
              </option>
              {nextStatus && (
                  <option value={nextStatus}>{nextStatus}</option>
                )}
            </select>
            <div
              className={`${styles.button} mt-5 bg-primary-500 text-white rounded-lg shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 font-semibold py-2 px-4 text-lg`}
              onClick={handleStatusUpdate}
              disabled={!status}
            >
              Update Status
            </div>
          </>
        )}
      </div>

      {data?.status === "Pending" && (
        <div className="flex space-x-2 mt-2">
          <button
            className="bg-green-500 text-white rounded-lg px-4 py-2 shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            onClick={() => handleAction("Accept")}
          >
            Accept
          </button>
          <button
            className="bg-red-500 text-white rounded-lg px-4 py-2 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            onClick={() => handleAction("Reject")}
          >
            Reject
          </button>
          <button
            className="bg-yellow-500 text-white rounded-lg px-4 py-2 shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
            onClick={() => handleAction("Modify")}
          >
            Modify
          </button>
        </div>
      )}

      <VerificationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onVerify={() => {
          orderUpdateHandler("Delivered");
          setModalOpen(false);
        }}
        orderId={id}
      />
    </div>
  );
};

export default OrderDetails;
