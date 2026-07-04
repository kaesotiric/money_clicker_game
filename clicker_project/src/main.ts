class Player{

    //change later
    #name: string;
    #buyPower : number
    #currClick : number
    constructor(name: string, clickPower: number, buyPower: number){
        this.#name = name;
        this.#currClick = clickPower;
        this.#buyPower = buyPower;

    }

    get name(){
        return this.#name;
    }
    get buyPower(){
        return this.#buyPower;
    }


    increaseCPS(by: number) : void {
        if(by>=0){
            this.#currClick+=by;
        }
    }
}

