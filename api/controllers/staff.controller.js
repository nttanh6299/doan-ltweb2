const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');
const { STATUS } = require('../utils/statusEnum');
const { Customer, Identity } = require('../models');

const findCustomer = asyncHandler(async (id) => {
  const customer = await Customer.findOne({
    attributes: ['username', 'email', 'name', 'phoneNumber', 'address'],
    where: {
      [Op.and]: [
        { id },
        {
          status: {
            [Op.ne]: STATUS.deleted,
          },
        },
      ],
    },
  });
  return customer;
});

exports.updateCustomerStatus = asyncHandler(async (req, res, next) => {
  const { idCustomer, status } = req.body;
  const newStatus = STATUS[status];
  if (!newStatus || (newStatus && newStatus === STATUS.deleted)) {
    return next(new AppError('Invalid status!', 400));
  }
  const customer = await findCustomer(idCustomer);
  if (!customer) {
    return next(new AppError("Can't find this customer!", 404));
  }
  customer.status = newStatus;
  customer.save();
  return res.status(200).json({
    status: 'success',
    data: customer,
  });
});

exports.getAllCustomers = asyncHandler(async (req, res, next) => {
  let { page, limit, sortBy, sortType } = req.query;
  const attributes = ['username', 'email', 'name', 'phoneNumber', 'address'];
  const sortTypes = ['asc', 'desc'];

  if (!page || page <= 0) page = 1;
  if (!limit || limit <= 0) limit = 10;
  if (!sortType || (sortType && !sortTypes.includes(sortType)))
    sortType = 'asc';

  if (!sortBy || (sortBy && !attributes.includes(sortBy))) sortBy = 'username';

  const filterArr = [];
  attributes.forEach((attr) => {
    if (req.query[attr]) {
      const obj = {};
      obj[attr] = { [Op.like]: `%${req.query[attr]}%` };
      filterArr.push(obj);
    }
  });
  const customers = await Customer.findAll({
    attributes: attributes,
    where: {
      [Op.and]: [
        {
          status: {
            [Op.ne]: STATUS.deleted,
          },
        },
        ...filterArr,
      ],
    },
    order: [[sortBy, sortType]],
    offset: limit * (page - 1),
    limit,
  });
  if (customers.length === 0) {
    return res.status(200).json({
      status: 'success',
      message: 'Customer not found!',
    });
  }
  return res.status(200).json({
    status: 'success',
    totalItems: customers.length,
    items: customers,
  });
});

exports.approveCustomer = asyncHandler(async (req, res, next) => {
  const staff = req.user;
  const { customerId } = req.body;
  if (!staff) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  const customer = await Identity.findOne({
    where: customerId,
  });
  if (!customer) {
    return next(new AppError('Customer not found', 404));
  }
  customer.staffIdApproved = staff.id;
  customer.save();
  return res.status(200).json({
    status: 'success',
    message: 'Customer have been approved',
  });
});
