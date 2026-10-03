
class StateManager {
    constructor() {
        this.stateStack = this.restoreStateStack();
        if(!this.stateStack) {
            location.hash = "#main";
            this.stateStack = ["main"];
        }

        this.stateElementsDict = { // dictionary of the overlay element for each state
            main: null,
            settings: document.getElementById("settings-screen"),
            eticket: document.getElementById("eticket-screen"),
            buybox: document.getElementById("buy-box"),
            loader: document.getElementById("loader-screen")
        };

        this.setVisualStateElement(this.state);

        window.addEventListener("popstate", (e) => {
            this.handlePopstate(e);
        });
    }

    get state() {
        return this.stateStack[this.stateStack.length-1];
    }

    popState() {
        return this.stateStack.splice(-1)[0];
    }
    pushState(state) {
        if(state === this.state) return false;
        this.stateStack.push(state);
        return true;
    }
    replaceState(newState) {
        if(newState === this.state) {
            console.log("Cannot replace equal state");
            return false;
        }
        this.stateStack[this.stateStack.length-1] = newState;
        return true;
    }


    goBack() {
        //this.popStateHandled = false;
        history.back();
    }
    handlePopstate(event) {
        if(this.popStateHandled) {
            this.popStateHandled = false;
            return "already handled";
        }
        //const navigatedToState = this.getCurrentHashState();
        const navigatedToState = this.stateStack[this.stateStack.length-2] || "main";
        const {requiresAnimation, changeType, oldVisualStateElement} = this.changeState(navigatedToState);

        if(requiresAnimation)
            this.executeTransition(navigatedToState, {visualStateElement: oldVisualStateElement});

    }
    getCurrentHashState() {
        return location.hash.replaceAll(/\#|\//g, "");
    }
    restoreStateStack() {
        return localStorage.getItem("state-stack")?.split("\t");
    }


    changeState(newState, isReplace) {
        let requiresAnimation = true, changeType;
        const prevState = this.stateStack.slice(-2,-1)[0];
        if(isReplace) {
            requiresAnimation = this.replaceState(newState);
            changeType = "replace";
            history.replaceState(newState, "", "#"+newState);
        }
        else if(prevState === newState) {
            this.popState(); 
            requiresAnimation = true; // always requires animation because prev state cannot = current state
            changeType = "pop";
            if(this.popStateHandled === false) {
                this.popStateHandled = true;
                history.back();
            }
            if(this.getCurrentHashState() !== newState) {
                history.replaceState(newState, "", "#"+newState);
            }
        }
        else {
            requiresAnimation = this.pushState(newState);
            changeType = "push";
            history.pushState(newState, "", "#"+newState);
        }
        const oldVisualStateElement = this.visualStateElement;
        this.setVisualStateElement(newState);
        if(newState === "settings") 
            loadCurrentSettings();
        return {requiresAnimation, changeType, oldVisualStateElement};
    }


    setVisualStateElement(stateName) {
        const elmnt = this.getVisualStateElement(stateName);
        this.visualStateElement = elmnt;
        return elmnt;
    }
    getVisualStateElement(stateName) {
        return this.stateElementsDict[stateName];
    }
    removeVisualStateElement(elmntOverride) {
        const elmnt = elmntOverride || this.visualStateElement;
        elmnt.style.transform = "";
        setTimeout(() => {
            elmnt.style.display = "none";
        }, 350);
    }
    // Core state transition methods
    async transitionTo(stateName, opt={}) {
        const {requiresAnimation, changeType, oldVisualStateElement} = this.changeState(stateName, opt.isReplace);
        if(requiresAnimation === false) 
            return false;
        opt.changeType = changeType;
        opt.visualStateElement = oldVisualStateElement;
        this.executeTransition(stateName, opt);
    }
    async executeTransition(newState, opt={}) {
        if(opt.changeType === "pop" || opt.changeType === "replace" || !opt.changeType)
            this.removeVisualStateElement(opt.visualStateElement);

        const elmntToShow = this.setVisualStateElement(newState);

        if(elmntToShow === null) {
            // show main screen => hide everything above it
            this.removeVisualStateElement(opt.visualStateElement);
            return;
        }

        const randDelay = Math.random() * (380 - 100) + 100;
        elmntToShow.style.display = "";
        setTimeout(() => {
            elmntToShow.style.transform = "none";
        }, randDelay);
    }

    // Navigation helper methods
    navigateToMain(opts) {
        return this.transitionTo("main", opts);
    }

    navigateToSettings() {
        return this.transitionTo("settings", { isReplace: true });
    }

    navigateToETicket(ticketType = "outbound") {
        const promise = this.transitionTo("eticket", { ticketType });
        // remove loader after a while
        const randDelay = Math.random() * (35000 - 20000) + 20000;
        const loader = document.getElementById("eticket-loader");
        const content = document.getElementById("eticket-failed");
        loader.style.display = "";
        content.style.display = "none";
        setTimeout(() => {
            loader.style.display = "none";
            content.style.display = "";
        }, randDelay);

        return promise;
    }

    navigateToBuyBox() {
        return this.transitionTo("buybox");
    }

    showLoader(sourceAction, targetState = null, timeout = 3000) {
        return this.transitionTo("loader", { sourceAction, targetState, timeout });
    }
}

window.stateManager = new StateManager();