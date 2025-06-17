const BASE_URL = "http://localhost:3001/api";

// Test health endpoint
async function testHealth() {
  try {
    const response = await fetch(`${BASE_URL.replace("/api", "")}/health`);
    const data = await response.json();
    console.log("✅ Health check:", data);
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
  }
}

// Test register endpoint
async function testRegister() {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        department: "Engineering",
      }),
    });
    const data = await response.json();
    console.log("✅ Register:", data);
    return data.token;
  } catch (error) {
    console.log("❌ Register failed:", error.message);
  }
}

// Test login endpoint
async function testLogin() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });
    const data = await response.json();
    console.log("✅ Login:", data);
    return data.token;
  } catch (error) {
    console.log("❌ Login failed:", error.message);
  }
}

// Test get users endpoint
async function testGetUsers(token) {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("✅ Get Users:", data);
  } catch (error) {
    console.log("❌ Get Users failed:", error.message);
  }
}

// Run tests
async function runTests() {
  console.log("🚀 Testing TeamPulse API...\n");

  await testHealth();
  console.log("");

  await testRegister();
  console.log("");

  const token = await testLogin();
  console.log("");

  if (token) {
    await testGetUsers(token);
  }

  console.log("\n✨ Tests completed!");
}

runTests();
