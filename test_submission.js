const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYyYmZiYjQ3LTY0NDMtNGQ1OS05NzE5LTQ4MTFlMjZmZDhiMyIsInVzZXJuYW1lIjoic3VwcGxpZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoic3VwcGxpZXIiLCJpYXQiOjE3NjczNTEzOTksImV4cCI6MTc2Nzk1NjE5OX0.Snehi52LAyKXoNmUltF8A1gIdK8_PnqMLox2Kj_5ayE";

const payload = {
  template_id: "448be6d1-b137-4486-b597-69385805debf",
  shop_id: "c9f2f99c-42a4-4118-b5c9-4ba623a7665c",
  rate: "1500",
  unit: "pcs",
  brandname: "TestBrand",
  modelnumber: "TM-001",
  subcategory: "Standard",
  technicalspecification: "Test spec",
  dimensions: "100x50x20",
  finishtype: "Matte",
  metaltype: "Steel"
};

fetch("http://localhost:5000/api/material-submissions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify(payload)
})
  .then(res => {
    console.log(`Status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log("Response:", JSON.stringify(data, null, 2));
  })
  .catch(err => console.error("Error:", err));
