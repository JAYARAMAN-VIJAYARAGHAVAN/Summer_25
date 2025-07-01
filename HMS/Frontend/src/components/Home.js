import React from 'react';

// Example placeholder image for department icons
const placeholderImg = "https://via.placeholder.com/48";

const departments = [
  {
    name: "Pediatrics",
    description: "We specialize in the medical care of infants, children, and adolescents, ensuring their overall health and well-being.",
    topDoctor: "Tharun Raj",
    img: placeholderImg,
  },
  {
    name: "Cardiology",
    description: "Our Cardiology department provides advanced care for a variety of heart-related conditions and procedures.",
    topDoctor: "Hrishikesh Sunilkumar",
    img: placeholderImg,
  },
  {
    name: "Neurology",
    description: "We diagnose and treat disorders of the nervous system, including the brain, spinal cord, and peripheral nerves.",
    topDoctor: "Avneesh Sridhar",
    img: placeholderImg,
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#f7fafd", display: "flex", flexDirection: "column" }}>
      
      {/* Hero Banner */}
      <div
        style={{
          borderRadius: "12px",
          margin: "32px auto 24px auto",
          width: "90%",
          maxWidth: "1200px",
          height: "180px",
          overflow: "hidden"
        }}
      >
        <img
          src="/Panaroma1.avif"  // 👈 using .avif from public
          alt="Hero Banner"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "12px"
          }}
        />
      </div>

      {/* Department Cards */}
      <div style={{ width: "90%", maxWidth: "1200px", margin: "0 auto" }}>
        {departments.map((dept, idx) => (
          <div
            key={dept.name}
            style={{
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 2px 8px 0 rgba(56, 120, 255, 0.06)",
              display: "flex",
              alignItems: "flex-start",
              padding: "24px",
              marginBottom: "24px",
              gap: "24px"
            }}
          >
            <img
              src={dept.img}
              alt={dept.name}
              style={{
                width: "48px",
                height: "48px",
                objectFit: "contain",
                background: "#f0f4f8",
                borderRadius: "8px",
                border: "1px solid #cfd8dc",
                marginTop: "4px"
              }}
            />
            <div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0077b6", marginBottom: "4px" }}>
                {dept.name}
              </div>
              <div style={{ color: "#374151", fontSize: "1.05rem", marginBottom: "8px" }}>
                {dept.description}
              </div>
              <div style={{ color: "#0077b6", fontWeight: 700, fontSize: "1.05rem" }}>
                Top Doctor: {dept.topDoctor}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer
        style={{
          background: "#0288d1",
          color: "#fff",
          textAlign: "center",
          padding: "14px 0",
          marginTop: "auto"
        }}
      >
        Contact Info
      </footer>
    </div>
  );
}
