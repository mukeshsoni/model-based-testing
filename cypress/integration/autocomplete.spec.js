import testPlans from "../../src/test_plans_cypress";

context("Autocomplete", () => {
  beforeEach(() => {
    cy.visit("localhost:3000");
  });

  testPlans.forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          await path.test(cy);
        });
      });
    });
  });

  it("should show autocomplete page", () => {
    cy.get("[role=option]").should("not.exist");
    cy.get("input[placeholder='Type a programming language']").focus();
    // cy.get("input").should("have.focus");
    // cy.get("[role=listbox]")
    // .get("[role=options]")
    // .should("have.length", 0);
    // cy.get("option").should("have.length", 0);
    // cy.get("input").type("a");
    // cy.get(".react-autosuggest__suggestion--highlighted").should(
    // "have.length",
    // 0
    // );
    // cy.get("input").type("{downarrow}");
    // cy.get(".react-autosuggest__suggestion--highlighted")
    // .its("length")
    // .should("be.gt", 0);
    // cy.get("[role=option]")
    // .its("length")
    // .should("be.gt", 0);
    // cy.get("[role=option]").then(items => {
    // const randomItemIndex = Math.floor(Math.random() * items.length);
    // const randomSuggestedItem = items[randomItemIndex];
    // randomSuggestedItem.click();
    // });
  });
});
