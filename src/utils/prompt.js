import inquirer from "inquirer";

export async function selectFromList(message, choices) {
  if (!choices || choices.length === 0) {
    throw new Error("No choices provided to prompt");
  }

  const { value } = await inquirer.prompt([
    {
      type: "list",
      name: "value",
      message,
      choices, // 👈 plain array works best
      pageSize: 10,
    },
  ]);

  return value;
}
