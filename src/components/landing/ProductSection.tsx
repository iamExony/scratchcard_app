import ProductCard from "./ProductCard";

const ProductsSection = () => {
  const products = [
    {
      title: "WAEC Result Checker",
      price: "₦3,369",
      description: "Get instant access to your WAEC examination results with our reliable checking service.",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
    },
    {
      title: "NECO Result Token",
      price: "₦1,178",
      description: "Access your NECO results quickly and securely with our verification token system.",
      image: "https://images.unsplash.com/photo-1606044718107-4c7234c69b1f?w=400&h=300&fit=crop",
    },
    {
      title: "NABTEB Result Checker",
      price: "₦970",
      description: "Check your NABTEB examination results instantly with our verification service.",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    },
    {
      title: "NBAIS Result Checker",
      price: "₦1,666",
      description: "Verify your NBAIS examination results with our secure checking platform.",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop",
    },
    {
      title: "WAEC Verification Pin",
      price: "₦3,735",
      description: "Official WAEC verification pins for certificate authentication and verification.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    },
    {
      title: "JAMB Result Checker",
      price: "₦2,500",
      description: "Access your JAMB UTME results and print your result slip with ease.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
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
