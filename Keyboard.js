
      class Keyboard {
        
          #listeners = [];
          #key;
          #ctrlKey=false;

          constructor(){
            document.addEventListener('keydown',this.handleKeyDown);
            console.log("Initiatedkeyboard");
        }

        addListener(listener){
          
          console.log(listener.name?.toLowerCase());
          const existingListener = this.#listeners.find((existingListener)=>existingListener==listener);
          console.log(existingListener);
          if(!existingListener)
          this.#listeners.push(listener);

        }

        removeListener(listener){
          for(let i=0;i<this.#listeners.length;i++){
            if(this.#listeners[i]==listener){
              this.#listeners.splice(i,1);
              break;
            }
          }
        }

        getKey(){
          return this.#key;
        }

        getCtrlKey(){
          return this.#ctrlKey;
        }


        handleKeyDown = (e)=> {

            this.#key = e.key;
            this.#ctrlKey = e.ctrlKey;

            for(let listener of this.#listeners){
              if(listener.name?.toLowerCase().includes("keydown"))
              listener.call(root);
            }
        }
      }