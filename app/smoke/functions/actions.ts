"use server";

/**
 * Server action for form submission.
 * Simulates processing form data on the server.
 */
export async function submitFormAction(formData: FormData) {
  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;

  // Simulate server processing
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!name || !email) {
    return {
      success: false,
      message: "Name and email are required",
    };
  }

  // In a real app, you would save to a database here
  console.log("[Server Action] Form submitted:", { name, email });

  return {
    success: true,
    message: `Form submitted successfully for ${name}!`,
  };
}
