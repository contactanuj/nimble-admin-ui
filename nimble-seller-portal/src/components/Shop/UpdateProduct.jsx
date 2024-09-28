import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { updateProduct, fetchProductDetails } from "../../redux/actions/product";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";

const UpdateProduct = () => {
  const { id } = useParams(); // Get the product ID from the URL parameters
  const { seller } = useSelector((state) => state.seller);
  const { productDetails, success, error } = useSelector((state) => state.products);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]); // Existing images
  const [newImages, setNewImages] = useState([]); // New images uploaded by the user
  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [barCodeContent, setBarCodeContent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState();
  const [discountPrice, setDiscountPrice] = useState();
  const [stock, setStock] = useState();

  useEffect(() => {
    // Fetch product details when the component mounts
    if (id) {
      dispatch(fetchProductDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    // Populate form fields with product details when they are loaded
    if (productDetails) {
      setName(productDetails.name);
      setProductId(productDetails.productId);
      setDescription(productDetails.description);
      setBarCodeContent(productDetails.barCodeContent);
      setCategory(productDetails.category);
      setTags(productDetails.tags);
      setOriginalPrice(productDetails.originalPrice);
      setDiscountPrice(productDetails.discountPrice);
      setStock(productDetails.stock);
      setImages(productDetails.images); // Set existing images
    }
  }, [productDetails]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success("Product updated successfully!");
      navigate("/dashboard");
      window.location.reload();
    }
  }, [dispatch, error, success]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
  
    setNewImages([]);
    setImages([]);
  
    files.forEach((file) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        if (reader.readyState === 2) {
          setNewImages((old) => [...old, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedForm = new FormData();

    // Only append new images to the FormData if they exist
    newImages.forEach((image) => {
      updatedForm.set("images", image);
    });

    // Append the existing images (unchanged)
    if (newImages.length === 0) {
      updatedForm.append("images", JSON.stringify(images)); // If no new images, use the existing images
    }

    updatedForm.append("name", name);
    updatedForm.append("productId", productId);
    updatedForm.append("description", description);
    updatedForm.append("barCodeCotent", barCodeContent);
    updatedForm.append("category", category);
    updatedForm.append("tags", tags);
    updatedForm.append("originalPrice", originalPrice);
    updatedForm.append("discountPrice", discountPrice);
    updatedForm.append("stock", stock);
    updatedForm.append("shopId", seller._id);

    dispatch(
      updateProduct(id, {
        name,
        productId,
        description,
        barCodeContent,
        category,
        tags,
        originalPrice,
        discountPrice,
        stock,
        shopId: seller._id,
        images: newImages.length > 0 ? newImages : images, // Only send new images if they exist
      })
    );
  };

  return (
    <div className="w-[90%] 800px:w-[50%] bg-white  shadow h-[80vh] rounded-[4px] p-3 overflow-y-scroll">
      <h5 className="text-[30px] font-Poppins text-center">Update Product</h5>
      {/* update product form */}
      <form onSubmit={handleSubmit}>
        <br />
        <div>
          <label className="pb-2">
            Product Id <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="productId"
            value={productId}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter your product id..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={name}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your product name..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            cols="30"
            required
            rows="8"
            type="text"
            name="description"
            value={description}
            className="mt-2 appearance-none block w-full pt-2 px-3 border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your product description..."
          ></textarea>
        </div>
        <br />
        <div>
          <label className="pb-2">
            Bar Code Content <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="barCodeContent"
            value={barCodeContent}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setBarCodeContent(e.target.value)}
            placeholder="Enter your bar code content..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full mt-2 border h-[35px] rounded-[5px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Choose a category">Choose a category</option>
            {categoriesData &&
              categoriesData.map((i) => (
                <option value={i.title} key={i.title}>
                  {i.title}
                </option>
              ))}
          </select>
        </div>
        <br />
        <div>
          <label className="pb-2">Tags</label>
          <input
            type="text"
            name="tags"
            value={tags}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter your product tags..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">Original Price</label>
          <input
            type="number"
            name="price"
            value={originalPrice}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="Enter your product price..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Price (With Discount) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={discountPrice}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setDiscountPrice(e.target.value)}
            placeholder="Enter your product price with discount..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">Stock</label>
          <input
            type="number"
            name="price"
            value={stock}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setStock(e.target.value)}
            placeholder="Enter your product stock..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">Upload Images</label>
          <input
            type="file"
            name="images"
            id="upload"
            className="hidden"
            multiple
            onChange={handleImageChange}
          />
          <div className="w-full flex items-center flex-wrap">
            {/* Preview existing images */}
            {images &&
              images.map((image, index) => (
                <img
                  src={image.url}
                  key={index}
                  alt=""
                  className="h-[120px] w-[120px] object-cover m-2"
                />
              ))}
            {/* Preview new images */}
            {newImages &&
              newImages.map((image, index) => (
                <img
                  src={image}
                  key={index}
                  alt=""
                  className="h-[120px] w-[120px] object-cover m-2"
                />
              ))}

            <label htmlFor="upload">
              <AiOutlinePlusCircle size={30} className="mt-3" color="#555" />
            </label>
          </div>
        </div>
        <br />
        <div>
          <input
            type="submit"
            value="Update"
            className="w-full border h-[35px] rounded-[3px] text-center cursor-pointer mt-8"
          />
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
