const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AbdulSupplyChain", function () {
  let supplyChain;
  let admin, manufacturer, distributor, retailer, customer;

  // Role enum values matching the contract
  const Role = { None: 0, Manufacturer: 1, Distributor: 2, Retailer: 3, Customer: 4 };
  const Status = { Manufactured: 0, InTransit: 1, Delivered: 2 };

  beforeEach(async function () {
    [admin, manufacturer, distributor, retailer, customer] = await ethers.getSigners();

    const SupplyChain = await ethers.getContractFactory("AbdulSupplyChain");
    supplyChain = await SupplyChain.deploy();
    await supplyChain.waitForDeployment();

    // Assign roles
    await supplyChain.assignRole(manufacturer.address, Role.Manufacturer);
    await supplyChain.assignRole(distributor.address, Role.Distributor);
    await supplyChain.assignRole(retailer.address, Role.Retailer);
    await supplyChain.assignRole(customer.address, Role.Customer);
  });

  it("Should deploy and set admin correctly", async function () {
    expect(await supplyChain.admin()).to.equal(admin.address);
  });

  it("Should assign roles correctly", async function () {
    expect(await supplyChain.getRole(distributor.address)).to.equal(Role.Distributor);
    expect(await supplyChain.getRole(retailer.address)).to.equal(Role.Retailer);
    expect(await supplyChain.getRole(customer.address)).to.equal(Role.Customer);
  });

  it("Should register a product (Manufacturer only)", async function () {
    await supplyChain.connect(manufacturer).registerProduct("Laptop", "Gaming Laptop");
    const product = await supplyChain.getProduct(1);
    expect(product.name).to.equal("Laptop");
    expect(product.status).to.equal(Status.Manufactured);
    expect(product.currentOwner).to.equal(manufacturer.address);
  });

  it("Should NOT allow non-manufacturer to register a product", async function () {
    await expect(
      supplyChain.connect(distributor).registerProduct("Laptop", "Gaming Laptop")
    ).to.be.revertedWith("Only Manufacturer can call this");
  });

  it("Should transfer ownership: Manufacturer → Distributor", async function () {
    await supplyChain.connect(manufacturer).registerProduct("Phone", "Smartphone");
    await supplyChain.connect(manufacturer).transferOwnership(1, distributor.address, "Sent to distributor");

    const product = await supplyChain.getProduct(1);
    expect(product.currentOwner).to.equal(distributor.address);
    expect(product.status).to.equal(Status.InTransit);
  });

  it("Should transfer full chain and mark Delivered", async function () {
    await supplyChain.connect(manufacturer).registerProduct("TV", "Smart TV");
    await supplyChain.connect(manufacturer).transferOwnership(1, distributor.address, "To distributor");
    await supplyChain.connect(distributor).transferOwnership(1, retailer.address, "To retailer");
    await supplyChain.connect(retailer).transferOwnership(1, customer.address, "To customer");

    const product = await supplyChain.getProduct(1);
    expect(product.status).to.equal(Status.Delivered);
    expect(product.currentOwner).to.equal(customer.address);
  });

  it("Should return full product history (audit trail)", async function () {
    await supplyChain.connect(manufacturer).registerProduct("Watch", "Smart Watch");
    await supplyChain.connect(manufacturer).transferOwnership(1, distributor.address, "Shipped");

    const history = await supplyChain.getProductHistory(1);
    expect(history.length).to.equal(2);
    expect(history[0].note).to.equal("Product manufactured and registered");
    expect(history[1].note).to.equal("Shipped");
  });

  it("Should NOT allow skipping roles (Manufacturer → Retailer)", async function () {
    await supplyChain.connect(manufacturer).registerProduct("Bag", "Leather Bag");
    await expect(
      supplyChain.connect(manufacturer).transferOwnership(1, retailer.address, "Skip!")
    ).to.be.revertedWith("Manufacturer can only transfer to Distributor");
  });
});