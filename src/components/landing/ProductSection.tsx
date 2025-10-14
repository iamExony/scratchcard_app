import ProductCard from "./ProductCard";

const ProductsSection = () => {
  const products = [
    {
      title: "WAEC Result Checker",
      price: "₦4,000",
      description: "Get instant access to your WAEC examination results with our reliable checking service.",
      image: "/cards/waec_result.jpeg",
    },
    {
      title: "NECO Result Token",
      price: "₦2,000",
      description: "Access your NECO results quickly and securely with our verification token system.",
      image: "/cards/neco_result.jpeg",
    },
    {
      title: "NABTEB Result Checker",
      price: "₦970",
      description: "Check your NABTEB examination results instantly with our verification service.",
      image: "/cards/nabteb1.jpg",
    },
    {
      title: "NBAIS Result Checker",
      price: "₦1,666",
      description: "Verify your NBAIS examination results with our secure checking platform.",
      image: "/cards/nbais_result.jpeg",
    },
    {
      title: "WAEC Verification Pin",
      price: "₦3,735",
      description: "Official WAEC verification pins for certificate authentication and verification.",
      image: "/cards/waec_verification_pin.jpeg",
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Products
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Reliable and affordable examination result checking services for Nigerian students
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
