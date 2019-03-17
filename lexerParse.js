
class HTMLLexicalParser {
    constructor(syntaxer){
        this.state = this.data;       
        this.syntaxer =syntaxer;
        this.token = null
        this.attribute = null
        this.characterReference = ''
        this.endToken = null
    }
    data(c){
      if(c=="&") {
          return this.characterReferenceInData;
      }
      if(c=="<") {
          return this.tagOpenState;
      }
      else if(c=="\0") {
          error();
          this.emitToken(c);
          return this.data;
      }
      // else if(c==EOF) {
      //     this.emitToken(EOF);
      //     return data;
      // }
      else {
          this.emitToken(c);
          return this.data;
      }
    }
    tagOpenState(c){
      if(c==="/") {
          return this.endTagOpenState;
      }
      if(c.match(/[A-Z]/)) {
          this.token = new StartTagToken();
          this.token.name = c.toLowerCase();
          return this.tagNameState;
      }
      if(c.match(/[a-z]/)) {
          this.token = new StartTagToken();
          this.token.name = c;
          return this.tagNameState;
      }
      if(c=="?") {
          return this.bogusCommentState;
      }
      else {
          error();
          return this.data;
      }
    }
    endTagOpenState(c){  
      if (/[a-zA-Z]/.test(c)) {
        this.token = new EndTagToken()
        this.token.name = c.toLowerCase()
        return this.tagNameState
      }
      if (c === '>') {
        return this.error(c)
      }  

    }
    selfClosingTag (c) {
      if (c === '>') {
        this.emitToken(this.token)
        this.endToken = new EndTagToken()
        this.endToken.name = this.token.name
        this.emitToken(this.endToken)
        return this.data
      }
    }
  
    tagNameState(c){  
       if  (c === '/') {
         return this.selfClosingTag
       }
       if  (/[\t \f\n]/.test(c)) {
         return this.beforeAttributeName
       }
       if (c === '>') {
         this.emitToken(this.token)
         return this.data
       }
       if (/[a-zA-Z]/.test(c)) {
         this.token.name += c.toLowerCase()
         return this.tagNameState
       }

    }
    bogusCommentState(c){    

    }
    emitToken (token) {
      this.syntaxer.receiveInput(token)
    }

    error (c) {
      console.log(`warn: unexpected char '${c}'`)
    }
    receiveInput(char){        
       this.state = this.state(char);
    }
    beforeAttributeName (c) {
    if (/[\t \f\n]/.test(c)) {
      return this.beforeAttributeName
    }
    if (c === '/') {
      return this.selfClosingTag
    }
    if (c === '>') {
      this.emitToken(this.token)
      return this.data
    }
    if (/["'<]/.test(c)) {
      return this.error(c)
    }

    this.attribute = new Attribute()
    this.attribute.name = c.toLowerCase()
    this.attribute.value = ''
    return this.attributeName
  }

   attributeName (c) {
    if (c === '/') {
      this.token[this.attribute.name] = this.attribute.value
      return this.selfClosingTag
    }
    if (c === '=') {
      return this.beforeAttributeValue
    }
    if (/[\t \f\n]/.test(c)) {
      return this.beforeAttributeName
    }
    this.attribute.name += c.toLowerCase()
    return this.attributeName
  }

   beforeAttributeValue (c) {
    if (c === '"') {
      return this.attributeValueDoubleQuoted
    }
    if (c === "'") {
      return this.attributeValueSingleQuoted
    }
    if (/\t \f\n/.test(c)) {
      return this.beforeAttributeValue
    }
    this.attribute.value += c
    return this.attributeValueUnquoted
  }
  attributeValueDoubleQuoted (c) {
    if (c === '"') {
      this.token[this.attribute.name] = this.attribute.value
      return this.beforeAttributeName
    }
    this.attribute.value += c
    return this.attributeValueDoubleQuoted
  }

  attributeValueSingleQuoted (c) {
    if (c === "'") {
      this.token[this.attribute.name] = this.attribute.value
      return this.beforeAttributeName
    }
    this.attribute.value += c
    return this.attributeValueSingleQuoted
  }

  attributeValueUnquoted (c) {
    if (/[\t \f\n]/.test(c)) {
      this.token[this.attribute.name] = this.attribute.value
      return this.beforeAttributeName
    }
    this.attribute.value += c
    return this.attributeValueUnquoted
  }    
}


class StartTagToken{
    constructor(){
      this.name='';
    }
}
class Attribute{

}
class EndTagToken{
    
}
module.exports = {
    HTMLLexicalParser,
    StartTagToken
}

