      class Mouse {
       
        #x;
        #y;
        #dragPrevX;
        #dragPrevY;
        #listeners = [];

        constructor(id){
            const ele = document.getElementById(id);
            ele.addEventListener('mousedown',this.handleMouseDown);
            ele.addEventListener('mousemove',this.handleMouseMove);
            ele.addEventListener('mouseup',this.handleMouseUp);
            console.log("Initiatedmouse");

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

        handleMouseUp= (e)=>{
          for(let listener of this.#listeners){
              if(listener.name?.toLowerCase().includes("mouseup"))
              listener.call(root);
            }
        }

        handleMouseMove= (e)=>{
            this.#x = e.offsetX;
            this.#y = e.offsetY;
            for(let listener of this.#listeners){
              if(listener.name?.toLowerCase().includes("mousemove"))
              listener.call(root);
            }
        }

        handleMouseDown = (e)=>{
            this.#dragPrevX = e.offsetX;
            this.#dragPrevY = e.offsetY;
            for(let listener of this.#listeners){
              if(listener.name?.toLowerCase().includes("mousedown")){
                console.log("mousedown",root);
              listener.call(root);
              }
            }
        }

        getX(){
            return this.#x;
        }

        getY(){
            return this.#y;
        }

        getDragPrevX(){
            return this.#dragPrevX;
        }

        getDragPrevY(){
            return this.#dragPrevY;
        }
        getDragOffset(){
          return {
            x: this.getX() - this.getDragPrevX(),
            y: this.getY() - this.getDragPrevY()
          };
        }

      }