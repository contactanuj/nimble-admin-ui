import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backend_url, server } from "../../server";
import { AiOutlineCamera } from "react-icons/ai";
import styles from "../../styles/styles";
import axios from "axios";
import { loadSeller } from "../../redux/actions/user";
import { toast } from "react-toastify";
import Select from "react-select"; // Import React-Select for styled multi-select dropdown

const ShopSettings = () => {
  const { seller } = useSelector((state) => state.seller);
  const [avatar, setAvatar] = useState();
  const [name, setName] = useState(seller && seller.name);
  const [description, setDescription] = useState(
    seller && seller.description ? seller.description : ""
  );
  const [address, setAddress] = useState(seller && seller.address);
  const [phoneNumber, setPhoneNumber] = useState(seller && seller.phoneNumber);
  const [zipCode, setZipcode] = useState(seller && seller.zipCode);
  const [collectionTime, setCollectionTime] = useState(seller?.collectionTime || []);

  const dispatch = useDispatch();

  const timeSlots = [
    { value: "12:00 AM - 01:00 AM", label: "12:00 AM - 01:00 AM" },
    { value: "01:00 AM - 02:00 AM", label: "01:00 AM - 02:00 AM" },
    { value: "02:00 AM - 03:00 AM", label: "02:00 AM - 03:00 AM" },
    { value: "03:00 AM - 04:00 AM", label: "03:00 AM - 04:00 AM" },
    { value: "04:00 AM - 05:00 AM", label: "04:00 AM - 05:00 AM" },
    { value: "05:00 AM - 06:00 AM", label: "05:00 AM - 06:00 AM" },
    { value: "06:00 AM - 07:00 AM", label: "06:00 AM - 07:00 AM" },
    { value: "07:00 AM - 08:00 AM", label: "07:00 AM - 08:00 AM" },
    { value: "08:00 AM - 09:00 AM", label: "08:00 AM - 09:00 AM" },
    { value: "09:00 AM - 10:00 AM", label: "09:00 AM - 10:00 AM" },
    { value: "10:00 AM - 11:00 AM", label: "10:00 AM - 11:00 AM" },
    { value: "11:00 AM - 12:00 PM", label: "11:00 AM - 12:00 PM" },
    { value: "12:00 PM - 01:00 PM", label: "12:00 PM - 01:00 PM" },
    { value: "01:00 PM - 02:00 PM", label: "01:00 PM - 02:00 PM" },
    { value: "02:00 PM - 03:00 PM", label: "02:00 PM - 03:00 PM" },
    { value: "03:00 PM - 04:00 PM", label: "03:00 PM - 04:00 PM" },
    { value: "04:00 PM - 05:00 PM", label: "04:00 PM - 05:00 PM" },
    { value: "05:00 PM - 06:00 PM", label: "05:00 PM - 06:00 PM" },
    { value: "06:00 PM - 07:00 PM", label: "06:00 PM - 07:00 PM" },
    { value: "07:00 PM - 08:00 PM", label: "07:00 PM - 08:00 PM" },
    { value: "08:00 PM - 09:00 PM", label: "08:00 PM - 09:00 PM" },
    { value: "09:00 PM - 10:00 PM", label: "09:00 PM - 10:00 PM" },
    { value: "10:00 PM - 11:00 PM", label: "10:00 PM - 11:00 PM" },
    { value: "11:00 PM - 12:00 AM", label: "11:00 PM - 12:00 AM" }
];

  const handleImage = async (e) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatar(reader.result);
        axios
          .put(
            `${server}/shop/update-shop-avatar`,
            { avatar: reader.result },
            {
              withCredentials: true,
            }
          )
          .then((res) => {
            dispatch(loadSeller());
            toast.success("Avatar updated successfully!");
          })
          .catch((error) => {
            toast.error(error.response.data.message);
          });
      }
    };

    reader.readAsDataURL(e.target.files[0]);
  };

  const handleCollectionTimeChange = (selectedOptions) => {
    setCollectionTime(selectedOptions.map(option => option.value));
  };

  const updateHandler = async (e) => {
    e.preventDefault();

    await axios
      .put(
        `${server}/shop/update-seller-info`,
        {
          name,
          address,
          zipCode,
          phoneNumber,
          description,
          collectionTime,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Shop info updated successfully!");
        dispatch(loadSeller());
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="flex w-full 800px:w-[80%] flex-col justify-center my-5">
        <div className="w-full flex items-center justify-center">
          <div className="relative">
            <img
              src={avatar ? avatar : `${seller.avatar?.url}`}
              alt=""
              className="w-[200px] h-[200px] rounded-full cursor-pointer"
            />
            <div className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[10px] right-[15px]">
              <input
                type="file"
                id="image"
                className="hidden"
                onChange={handleImage}
              />
              <label htmlFor="image">
                <AiOutlineCamera />
              </label>
            </div>
          </div>
        </div>

        {/* Shop info */}
        <form
          aria-required={true}
          className="flex flex-col items-center"
          onSubmit={updateHandler}
        >
          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Name</label>
            </div>
            <input
              type="text"
              placeholder={seller.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Description</label>
            </div>
            <input
              type="text"
              placeholder={seller?.description || "Enter your shop description"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
            />
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Address</label>
            </div>
            <input
              type="text"
              placeholder={seller?.address}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Phone Number</label>
            </div>
            <input
              type="number"
              placeholder={seller?.phoneNumber}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Zip Code</label>
            </div>
            <input
              type="number"
              placeholder={seller?.zipCode}
              value={zipCode}
              onChange={(e) => setZipcode(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          {/* Collection Time */}
          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Select Collection Time</label>
            </div>
            <Select
              isMulti
              name="collectionTime"
              options={timeSlots}
              value={timeSlots.filter((slot) => collectionTime.includes(slot.value))}
              onChange={handleCollectionTimeChange}
              className="w-[95%] mb-4"
              placeholder="Select time slots"
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderColor: "#ccc",
                  borderRadius: "8px",
                  padding: "8px",
                }),
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: "#007bff",
                  color: "white",
                  borderRadius: "4px",
                }),
                multiValueLabel: (provided) => ({
                  ...provided,
                  color: "white",
                }),
                multiValueRemove: (provided) => ({
                  ...provided,
                  color: "white",
                  ':hover': {
                    backgroundColor: "#ff5c5c",
                    color: "white",
                  },
                }),
              }}
            />
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <button
              type="submit"
              className="w-[95%] h-[40px] border border-[#3957db] text-center text-[#3957db] rounded-[3px] mt-8 cursor-pointer hover:bg-[#3957db] hover:text-white transition-all duration-300 ease-in-out font-[600]"
            >
              Update Shop
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopSettings;
