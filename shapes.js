//Generate random hex number
const randomHex = () => Math.round(Math.random() * 255);

const line = (startPosition, allPositions, { close, fill, fillColor,lineWidth }) => {
  ctx.lineWidth = lineWidth || 1;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(startPosition[0], startPosition[1]);
  for (let i = 0; i < allPositions.length; i += 2) {
    ctx.lineTo(allPositions[i], allPositions[i + 1]);
  }
  close && ctx.closePath();
  ctx.strokeStyle="rgb(255,10,10)";
  fill && (ctx.fillStyle = fillColor);
  fill ? ctx.fill() : ctx.stroke();
};

const curve = (startPosition, allPositions, { close, fill, fillColor })=>{
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(startPosition[0], startPosition[1]);
  for (let i = 0; i < allPositions.length; i += 4) {
    ctx.quadraticCurveTo(allPositions[i], allPositions[i + 1],allPositions[i+2], allPositions[i + 3]);
  }
  //ctx.bezierCurveTo(allPositions[0],allPositions[1],allPositions[2],allPositions[3],allPositions[4],allPositions[5]);
  close && ctx.closePath();
  fill && (ctx.fillStyle = fillColor);
  fill ? ctx.fill() : ctx.stroke();
}

const triangle = (x, y, height, width, shapeProps) => {
  line(
    [x, y],
    [x + width, y + height, x - width, y + height],
    shapeProps
  );
};

const box = (x, y, height, width, shapeProps) => {
  line(
    [x, y],
    [x + width, y, x + width, y + height, x, y + height],
    shapeProps
  );
};

const circle = (x, y, radius) => {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.fillColor = "rgba(25, 120, 164, 1)";
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
};

const arc = (x, y, radiusX,radiusY,fill,fillColor) => {
  ctx.beginPath();
  //ctx.moveTo(0, 0);
  const startDegree = 180,endDegree = 270;
  //ctx.quadraticCurveTo(60, 60, 50, 100);
  //ctx.arc(x,y, radius, startDegree * Math.PI/180, endDegree * Math.PI/180);
  fill && (ctx.fillStyle = fillColor);
  //ctx.arc(x,y, radius, 3, 10);
  ctx.ellipse(x, y, radiusX, radiusY, 0, 3, 10);
  fill ? ctx.fill(): ctx.stroke();
};


const getCurrentShapeIndex = (tempShapes, x, y) => {
  return tempShapes.findLastIndex((tempShape, index) => {
    const shape = tempShape.getShapeProps();
    let boundX = false,boundY=false;
    //console.log("type",tempShape);
    if(tempShape instanceof Box){
    boundX =
      shape.width > 0
        ? x >= shape.x && x <= shape.x + shape.width
        : x <= shape.x && x >= shape.x + shape.width;
     boundY =
      shape.height > 0
        ? y >= shape.y && y <= shape.y + shape.height
        : y <= shape.y && y >= shape.y + shape.height;
        
    }
    else if(tempShape instanceof Triangle){
     boundX =
      shape.width > 0
        ? x >= shape.x-shape.width && x <= shape.x + shape.width
        : x <= shape.x-shape.width && x >= shape.x + shape.width;
     boundY =
      shape.height > 0
        ? y >= shape.y && y <= shape.y + shape.height
        : y <= shape.y && y >= shape.y + shape.height;
    }
    else if(tempShape instanceof Arc){
      boundX = x>=(shape.prevX-shape.radius) && x<= (shape.prevX+shape.radius);
      boundY = y>=(shape.prevY-shape.radius) && y<= (shape.prevY+shape.radius);
    }
    else if(tempShape instanceof Line){
      boundX = shape.x1 > shape.x ? x>=(shape.x) && x<= (shape.x1):  x>=(shape.x1) && x<= (shape.x);
      boundY = shape.y1 > shape.y ? y>=(shape.y) && y<= (shape.y1):  y>=(shape.y1) && y<= (shape.y);
    }

    return boundX && boundY;
  });
};

const shapesFactory = {
  circle,
  triangle,
  box,
  line,
  curve
};

const ShapeUtils = {
  getCurrentShapeIndex,
};

class Shape {
  #shapeProps;
  #isDrawing = false;
  #isMoving = false;
  #prevX = 0;
  #prevY = 0;
  static #currentShape="";
  static #pathNum = -1;
  static #shapes = [];
  static #redoshapes = [];

  constructor(shapeProps) {
    this.#shapeProps = shapeProps;
    if (!shapeProps) {
      mouse.addListener(this.handleMouseDown);
      mouse.addListener(this.handleMouseMove);
      mouse.addListener(this.handleMouseUp);
      keyboard.addListener(this.handleKeyDown);
      
      //console.log("addingShapes", shapeProps);
    }
  }

  handleKeyDown(){
    const key = keyboard.getKey();
    const ctrlKey = keyboard.getCtrlKey();

    if (ctrlKey) {
      if (key.toLowerCase() == "z") {
        const lastShape = this.removeShape();
        if (lastShape) {
          Shape.#redoshapes.push(lastShape);
        }
        requestAnimationFrame((timestamp)=>this.draw(timestamp));
      }
      if (key.toLowerCase() == "y") {
        const lastShape = Shape.#redoshapes.pop();
        if (lastShape) {
          this.addShape(lastShape);
        }
        requestAnimationFrame((timestamp)=>this.draw(timestamp));
      }
      if (key.toLowerCase() == "v") {
        const copiedShape = this.getShape(Shape.#pathNum);
        //console.log("CopiedShape", copiedShape);
        if (copiedShape) {
          this.addShape(this.copyShape(copiedShape));
        }
        requestAnimationFrame((timestamp)=>this.draw(timestamp));
      }
    }
    if (key.toLowerCase() == "d") {
      this.#isMoving = true;
    } else if (!(ctrlKey && key.toLowerCase() == "v")) {
      this.#isMoving = false;
    }
    if(key.toLowerCase()=="b"){
      Shape.#currentShape = "box";
    }
    else if(key.toLowerCase()=="t"){
      Shape.#currentShape = "triangle";
    }
    else if(key.toLowerCase()=="c"){
      Shape.#currentShape = "circle";
    }
    else if(key.toLowerCase()=="l"){
      Shape.#currentShape = "line";
    }
    else if(key.toLowerCase()=="p"){
      Shape.#currentShape = "pencil";
    }
    else{
      Shape.#currentShape = "";
    }
    console.log("CurrentShape",Shape.#currentShape);
  };

  handleMouseUp(){
      if (!this.#isMoving && !(Shape.#currentShape=="")) {
        const shape = this.getShape(this.getShapes().length-1);
        if ((this.#prevX == mouse.getX() && this.#prevY == mouse.getY()) || (shape && shape.getShapeProps().height==0 || shape.getShapeProps().width==0)) {
          this.removeShape();
        }
        else{
          if(shape.getShape()=="pencil"){
            const lastShape = this.removeShape();
            let allPoints = lastShape.getShapeProps().allPoints;
            let tempPoints = [];
           for(let i=0;i<allPoints.length;i+=4){
              console.log(i);
              tempPoints.push(...[allPoints[i],allPoints[i+1]]);
            }
            //tempPoints.push(...[allPoints[0], allPoints[1],allPoints[(allPoints.length/2)-2], allPoints[(allPoints.length/2)-1],allPoints[allPoints.length-2], allPoints[allPoints.length-1]]);

            console.log("tempPoints",JSON.parse(JSON.stringify(tempPoints)));
            lastShape.setShapeProps(
              {allPoints:JSON.parse(JSON.stringify(tempPoints))}
            );
            this.addShape(lastShape);
            requestAnimationFrame((timestamp)=>this.draw(timestamp));
          }
        }

        this.#prevX = 0;
        this.#prevY = 0;
      }

      //console.log("mouseup", this.getShapes());

      this.#isDrawing = false;
  };

  handleMouseMove(){
    //console.log("MouseMove Box");
    const dx = mouse.getX() - this.#prevX;
    const dy = mouse.getY() - this.#prevY;
    if (this.#isDrawing) {
      if (!this.#isMoving && !(Shape.#currentShape=="")) {
        const shape = this.getShape(this.getShapes().length - 1);
        console.log("ShapProps",shape.getShapeProps());
        if(Shape.#currentShape=="circle"){
        shape.setShapeProps({
          ...shape.getShapeProps(),
          x: mouse.getX(),
          y:mouse.getY(),
          radiusX: Math.abs(mouse.getX()-this.#prevX),
          radiusY: Math.abs(mouse.getY()-this.#prevY),
        });
        }
        else if(Shape.#currentShape=="line"){
        shape.setShapeProps({
          ...shape.getShapeProps(),
          x1: mouse.getX(),
          y1:mouse.getY()
        });
        }
        else if(Shape.#currentShape=="pencil"){
          const allPoints = shape.getShapeProps().allPoints;
        shape.setShapeProps({
          allPoints:allPoints.concat([mouse.getX(),mouse.getY()])
        });
        }
        else
        shape.setShapeProps({
          ...shape.getShapeProps(),
          height: dy,
          width: dx,
        });
        requestAnimationFrame((timestamp)=>this.draw(timestamp));
      }
      if (this.#isMoving && Shape.#pathNum !== -1) {

        console.log("Pathnum", Shape.#pathNum);

        const shape = this.getShape(Shape.#pathNum);
        const shapeProps = shape.getShapeProps();
        if(shape instanceof Arc){        
        console.log("Shapeprops ",shapeProps);
        shape.setShapeProps({
          ...shapeProps,
          prevX: shapeProps.prevX + dx,
          prevY: shapeProps.prevY + dy,
        });
        }
        else if(shape instanceof Line){  
        shape.setShapeProps({
          x1: shapeProps.x1 + dx,
          y1: shapeProps.y1 + dy,
          x: shapeProps.x + dx,
          y: shapeProps.y + dy,
        });
        }
        else{
        shape.setShapeProps({
          ...shapeProps,
          x: shapeProps.x + dx,
          y: shapeProps.y + dy,
        });
      }

        requestAnimationFrame((timestamp)=>this.draw(timestamp));

        this.#prevX = mouse.getX();
        this.#prevY = mouse.getY();
      }
    }
    requestAnimationFrame((timestamp)=>this.draw(timestamp));
  };

  handleMouseDown(){
    this.#prevX = mouse.getDragPrevX();
    this.#prevY = mouse.getDragPrevY();

    requestAnimationFrame((timestamp)=>this.draw(timestamp));

    Shape.#pathNum = ShapeUtils.getCurrentShapeIndex(
      this.getShapes(),
      this.#prevX,
      this.#prevY
    );
    //if(this.getShapes().length>0)
    console.log("MouseDown Box",this.getShape(Shape.#pathNum));

    this.#isDrawing = true;

    if (!this.#isMoving) {
      const fillColor = `rgb(${randomHex()},${randomHex()},${randomHex()})`;
      //console.log("currentShape",Shape.#currentShape);
      //shapes.push([e.offsetX,e.offsetY,0,0,fillColor]);
      if(Shape.#currentShape=="box"){
      this.addShape(
        new Box({
          x: mouse.getX(),
          y: mouse.getY(),
          height: 0,
          width: 0,
          close: true,
          fill: true,
          fillColor,
        })
      );
    }
    else if(Shape.#currentShape=="triangle"){
          this.addShape(
              new Triangle({
                x: mouse.getX(),
                y: mouse.getY(),
                height: 0,
                width: 0,
                close: true,
                fill: true,
                fillColor,
              })
          );
    }
    else if(Shape.#currentShape=="circle"){
      this.addShape(new Arc({
        x:mouse.getX(),
        y:mouse.getY(),
        prevX:this.#prevX,
        prevY:this.#prevY,
        radiusY: Math.abs(mouse.getY()-this.#prevY),
        radiusX: Math.abs(mouse.getX()-this.#prevX),
        fill:true,
        fillColor
      }));
    }
    else if(Shape.#currentShape=="line"){
      this.addShape(new Line({
        x1:mouse.getX(),
        y1:mouse.getY(),
        x:this.#prevX,
        y:this.#prevY
      }));
    }
    else if(Shape.#currentShape=="pencil"){
      this.addShape(new Pencil({
        allPoints:[mouse.getX(),mouse.getY()]
      }));
    }
  }
  };

  draw(timestamp){
    //console.log("timestamp", timestamp);
    //if(timestamp-start)

    //console.log("Drawing...", Shape.#pathNum);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const updatedShapes = this.getShapes();
    console.log(updatedShapes);
    const selectedShape = this.getShape(Shape.#pathNum);
    
    for (const shape of updatedShapes) {
      shape.draw();
    }
    if(Shape.#pathNum!=-1 && this.getShapes().length>0){
        selectedShape.showBounds();
    }

    line([mouse.getX()-10,mouse.getY()],[mouse.getX()+10,mouse.getY()],{close:false,lineWidth:2});
    line([mouse.getX(),mouse.getY()-10],[mouse.getX(),mouse.getY()+10],{close:false,lineWidth:2});



    //requestAnimationFrame(draw);
  };

  getIsDrawing() {
    return this.#isDrawing;
  }
  setIsDrawing(isDrawing) {
    this.#isDrawing = isDrawing;
  }

  getIsMoving() {
    return this.#isMoving;
  }
  setIsMoving(isMoving) {
    this.#isMoving = isMoving;
  }

  getShapeProps() {
    return this.#shapeProps;
  }
  setShapeProps(shapeProps) {
    this.#shapeProps = shapeProps;
  }

  getShapes() {
    return Shape.#shapes;
  }

  getShape(index) {
    return Shape.#shapes[index];
  }
  addShape(shape) {
    Shape.#shapes.push(shape);
  }

  removeShape() {
    return Shape.#shapes.pop();
  }
  copyShape(shape) {
    return new shape.constructor(shape.getShapeProps());
  }
}

class Box extends Shape {
  constructor(shape) {
    super(shape);
  }
  draw () {
    const { x, y, width, height, ...shapeProps } = this.getShapeProps();
    line(
      [x, y],
      [x + width, y, x + width, y + height, x, y + height],
      shapeProps
    );
  }
  getShape(){
    return "box";
  }
  showBounds(){
          const { x, y, width, height } = this.getShapeProps();
           shapesFactory.circle(x, y, 5);
            shapesFactory.circle(
              x + width,
              y + height,
              5
            );
            shapesFactory.circle(x, y + height, 5);
            shapesFactory.circle(x + width, y, 5);
            shapesFactory.line([x, y],[x + width, y,x + width, y + height,x, y + height],{close:true})

        }
}

class Triangle extends Shape{
  constructor(shape) {
    super(shape);
  }
  draw(){
    const { x, y, width, height, ...shapeProps } = this.getShapeProps();
    triangle(x,y,height,width,shapeProps);
  }
  getShape(){
    return "triangle";
  }
  showBounds(){
        const { x, y, width, height } = this.getShapeProps();
        shapesFactory.circle(x-width, y, 5);
        shapesFactory.circle(x + width, y + height, 5);
        shapesFactory.circle(x-width, y + height, 5);
        shapesFactory.circle(x + width, y, 5);
        shapesFactory.line([x-width, y],[x + width, y,x + width, y + height,x-width, y + height],{close:true})
  }
}

class Arc extends Shape {
  constructor(shape) {
    super(shape);
  }
  draw(){
    const {radiusX, radiusY,prevX,prevY,fill,fillColor} = this.getShapeProps();
    console.log("Drawing circle");
    arc(prevX,prevY,radiusX,radiusY,fill,fillColor);
  }
  getShape(){
    return "circle";
  }
  showBounds(){
        const { radius,prevX,prevY } = this.getShapeProps();
        shapesFactory.circle(prevX - radius, prevY-radius, 5);
        shapesFactory.circle(prevX + radius, prevY - radius, 5);
        shapesFactory.circle(prevX-radius, prevY + radius, 5);
        shapesFactory.circle(prevX + radius, prevY+radius, 5);
        shapesFactory.line([prevX - radius, prevY-radius],[prevX + radius, prevY - radius,prevX + radius, prevY+radius,prevX-radius, prevY + radius],{close:true})
  }
}

class Line extends Shape{
  constructor(shape) {
    super(shape);
  }
  draw(){
    const {x,y,x1,y1} = this.getShapeProps();
    console.log("Drawing line");
    shapesFactory.line([x,y],[x1,y1],{close:false,fill:false});
  }
  getShape(){
    return "line";
  }
  showBounds(){
        const { x,y,x1,y1 } = this.getShapeProps();
        shapesFactory.circle(x, y, 5);
        shapesFactory.circle(x1,y1, 5);
        shapesFactory.line([x,y],[x1,y1],{close:false})
  }
}



class Pencil extends Shape{
  constructor(shape) {
    super(shape);
  }
  draw(){
    const {allPoints} = this.getShapeProps();
    console.log("Drawing pencil");
    shapesFactory.curve([allPoints[0],allPoints[1]],allPoints,{close:false,fill:false});
  }
  getShape(){
    return "pencil";
  }
  showBounds(){
    
  }
}
