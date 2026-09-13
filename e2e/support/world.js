import { setWorldConstructor, World } from "@cucumber/cucumber";

class FairBetsWorld extends World {
  constructor(options) {
    super(options);
    this.baseUrl = "http://127.0.0.1:4173";
    this.browser = null;
    this.context = null;
    this.page = null;
  }
}

setWorldConstructor(FairBetsWorld);
