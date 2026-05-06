class AhoCorasickNode {
  constructor() {
    this.children = new Map();
    this.fail = null;
    this.outputs = [];
  }
}

class AhoCorasick {
  constructor(patterns) {
    this.root = new AhoCorasickNode();
    this.buildTrie(patterns);
    this.buildFailureLinks();
  }

  buildTrie(patterns) {
    for (const pattern of patterns) {
      let node = this.root;

      for (const char of pattern) {
        if (!node.children.has(char)) {
          node.children.set(char, new AhoCorasickNode());
        }

        node = node.children.get(char);
      }

      node.outputs.push(pattern);
    }
  }

  buildFailureLinks() {
    const queue = [];
    this.root.fail = this.root;

    for (const child of this.root.children.values()) {
      child.fail = this.root;
      queue.push(child);
    }

    while (queue.length > 0) {
      const current = queue.shift();

      for (const [char, child] of current.children.entries()) {
        let failNode = current.fail;

        while (failNode !== this.root && !failNode.children.has(char)) {
          failNode = failNode.fail;
        }

        if (failNode.children.has(char)) {
          child.fail = failNode.children.get(char);
        } else {
          child.fail = this.root;
        }

        child.outputs = child.outputs.concat(child.fail.outputs);
        queue.push(child);
      }
    }
  }

  search(text) {
    let node = this.root;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      while (node !== this.root && !node.children.has(char)) {
        node = node.fail;
      }

      if (node.children.has(char)) {
        node = node.children.get(char);
      }

      if (node.outputs.length > 0) {
        for (const pattern of node.outputs) {
          const start = i - pattern.length + 1;
          const end = i;

          if (isWholeWord(text, start, end)) {
            return true;
          }
        }
      }
    }

    return false;
  }
}

function isWordChar(char) {
  return /[a-z0-9]/i.test(char);
}

function isWholeWord(text, start, end) {
  const before = start > 0 ? text[start - 1] : null;
  const after = end < text.length - 1 ? text[end + 1] : null;

  const validBefore = before === null || !isWordChar(before);
  const validAfter = after === null || !isWordChar(after);

  return validBefore && validAfter;
}

module.exports = AhoCorasick;