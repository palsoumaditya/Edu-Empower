import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiArrowRight,
  FiBookOpen,
  FiUsers,
} from "react-icons/fi";

// Import sections
import CrowdFundingHero from "./Sections/CrowdFundingHero";
import CrowdFundingFeatures from "./Sections/CrowdFundingFeatures";
import CrowdFundingCTA from "./Sections/CrowdFundingCTA";
import CrowdFundingTestimonials from "./Sections/CrowdFundingTestimonials";
import { fundraiserService } from "../../api/fundraiserService";
import { userService } from "../../api/userService";
import { useUser } from "@clerk/clerk-react";
import { organizationService } from "../../api/organizationService";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { y: -10, transition: { duration: 0.2 } },
};

const CrowdFunding = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [userRole, setUserRole] = useState("");
  const [organizationDetails, setOrganizationDetails] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNoProjects, setShowNoProjects] = useState(false);

  const fetchFundraisers = async () => {
    try {
      const res = await fundraiserService.getAllFundraisers();
      setProjects(res);
      setFilteredProjects(res);
    } catch (err) {
      console.error("Error fetching fundraisers:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserRole = async () => {
    const currentUser = await userService.getUserById(user?.id);
    setUserRole(currentUser.role);
  };

  const getOrganizationDetails = async () => {
    const organizationDetails =
      await organizationService.getExistingOrganizationDetails(user?.id);
    setOrganizationDetails(organizationDetails);
  };

  const orgVerificationStatus = async () => {
    const status = await organizationService.getOrganizationVerificationStatus(
      user?.id
    );
    setVerificationStatus(status);
  };

  useEffect(() => {
    fetchFundraisers();
    getCurrentUserRole();
    getOrganizationDetails();
    orgVerificationStatus();

    const timeout = setTimeout(() => {
      if (!projects.length) {
        setShowNoProjects(true);
        setLoading(false);
      }
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let result = [...projects];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (project) => project.category === selectedCategory
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        // In a real app, you would sort by creation date
        break;
      case "mostFunded":
        result.sort((a, b) => b.raised - a.raised);
        break;
      case "endingSoon":
        result.sort((a, b) => a.daysLeft - b.daysLeft);
        break;
      case "mostPopular":
        result.sort((a, b) => b.backers - a.backers);
        break;
      default:
        break;
    }

    setFilteredProjects(result);
  }, [searchTerm, selectedCategory, sortBy, projects]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const calculateDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const timeDiff = end - today;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-gradient-to-b from-white to-indigo-50 min-h-screen">
      {/* Hero Section */}
      <CrowdFundingHero
        userRole={userRole}
        organizationDetails={organizationDetails}
        verificationStatus={verificationStatus}
      />

      {/* Features Section */}
      <CrowdFundingFeatures />

      {/* Projects Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto"></div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 relative inline-block">
            Current Campaigns
            <motion.div
              className="absolute -bottom-2 left-0 w-full h-1 bg-black"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            ></motion.div>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-6">
            Browse and support educational campaigns that resonate with you
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search campaigns..."
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="newest">Newest</option>
                <option value="mostFunded">Most Funded</option>
                <option value="endingSoon">Ending Soon</option>
                <option value="mostPopular">Most Popular</option>
              </select>

              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2">
                <FiFilter className="h-5 w-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => handleCategoryChange("scholarship")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === "scholarship"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Scholarships
            </button>
            <button
              onClick={() => handleCategoryChange("technology")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === "technology"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Technology
            </button>
            <button
              onClick={() => handleCategoryChange("supplies")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === "supplies"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              School Supplies
            </button>
            <button
              onClick={() => handleCategoryChange("program")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === "program"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Educational Programs
            </button>
          </div>

          {/* Project Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {loading ? (
              <div className="col-span-full flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-600 border-solid"></div>
              </div>
            ) : filteredProjects?.length > 0 ? (
              filteredProjects.map((project) => {
                const progress =
                  (project.raisedAmount / project.goalAmount) * 100 || 0;

                return (
                  <motion.div
                    key={project.id}
                    variants={cardVariants}
                    whileHover="hover"
                    className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform transform hover:shadow-lg"
                  >
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-5">
                      <h3 className="text-xl font-semibold mb-2">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {project.description.slice(0, 100)}...
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {Math.floor(progress)}% funded
                        </p>
                      </div>

                      <div className="flex justify-between text-sm text-gray-700 mb-3">
                        <div className="flex items-center gap-1">
                          <span>₹</span>
                          <span>
                            {project.raisedAmount} / {project.goalAmount}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiUsers />
                          <span>{project.donations?.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiBookOpen />
                          <span>
                            {(() => {
                              const daysLeft = calculateDaysLeft(
                                project.deadline
                              );
                              return daysLeft > 0
                                ? `${daysLeft} days left`
                                : "Expired";
                            })()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/crowdfunding/${project.id}`)}
                        className="mt-2 text-indigo-600 hover:underline font-medium flex items-center gap-1"
                      >
                        View Campaign <FiArrowRight />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : showNoProjects ? (
              <div className="col-span-full text-center text-gray-500 text-lg mt-6">
                No campaigns found.
              </div>
            ) : null}
          </motion.div>

          {/* Load More Button */}
          {filteredProjects?.length > 0 && (
            <div className="mt-12 text-center">
              <button className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition">
                Load More Projects
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <CrowdFundingTestimonials />

      {/* CTA Section */}
      <CrowdFundingCTA />
    </div>
  );
};

export default CrowdFunding;
