import testPlans from "../../src/models/datepicker/datepicker_test_plan_cypress";

context("Datepicker", () => {
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

  it.skip("should show autocomplete page", () => {
    cy.get("input")
      .should("not.have.focus")
      .get("button[aria-label='previous month']")
      .should("not.exist")
      // FOCUS
      .get("input")
      .focus()
      // foucussed
      .get("body")
      .contains("17")
      .should("exist")
      // BLUR
      .get("button[aria-label='outside element']")
      .click()
      // blurred
      .get("input")
      .should("not.have.focus")
      .get("button[aria-label='previous month']")
      .should("not.exist");
  });
});
