import sys
import re

S_FUNCTION = 1
S_PARAM = 2
S_PARAM_ADDED = 3
S_END = 4

def addanylabda(line):
    f = re.search(r"(.*?)([a-zA-Z0-9_]+)[\s]*=>[\s]*(.*)", line)
    if f is not None:
        return f.group(1) + "(" + f.group(2) + ":any)" + "=> " + f.group(3)
    return line

def addletany(line):
    f = re.search(r"([\s]*)let[\s]+([a-zA-Z0-9_]+)[\s](=)[\s]*\[[\s]*\][\s]*;?[\s]*$", line)
    if f is not None:
        return f.group(1) + "let " + f.group(2) + " : any = [];"
    f = re.search(r"([\s]*)let[\s]+([a-zA-Z0-9_]+)[\s](=)[\s]*\{[\s]*\}[\s]*;?[\s]*$", line)
    if f is not None:
        return f.group(1) + "let " + f.group(2) + " : any = {};"
    return line

def addany(line):
    if re.search(r"\??[\s]*:[\s]*any", line) is not None:
        return line
    if re.search(r"[\s]+if[\s]*\(", line) is not None:
        return line
    if re.search(r"[\s]+for[\s]*\(", line) is not None:
        return line
    if re.search(r"[\s]+while[\s]*\(", line) is not None:
        return line
    start = line.find("function")
    if start == -1:
        f = re.search(r"\(.+?\)[\s]*=>", line)
        if f is not None:
            start = f.start()
    else:
        start += len("function")
    if start == -1:
        f = re.search(r'[-a-zA-Z0-9]+\([^()]*?\)[\s]*{', line)
        if f is not None:
            start = f.start()
    if start >= 0:
        state = S_FUNCTION
        o = line[:start]
        par = ""
        while start < len(line):
            c = line[start]
            if state == S_FUNCTION:
                if c == "(":
                    state = S_PARAM
                    par = ""
                o += c
            elif state == S_PARAM:
                if c == "=":
                    o += "?:any "
                    state = S_PARAM_ADDED
                    o += c
                    par = ""
                elif c == ",":
                    o += "?:any,"
                    par = ""
                elif c == ")":
                    if par.strip() != "":
                        o += "?:any"
                        state = S_END
                    o += c
                else:
                    par += c
                    o += c
            elif state == S_PARAM_ADDED:
                if c == ")":
                    state = S_END
                    o += c
                elif c == ",":
                    state = S_PARAM
                    o += c
                    par = ""
                else:
                    o += c
            elif state == S_END:
                o += c
            else:
                o += c
            start += 1
        return o
    return line


if __name__ == '__main__':
    # addany("Path.getFragIconBack = (quality) => {")
    path = sys.argv[1]
    with open(path, "rb") as f:
        content = f.read().decode("UTF-8")
    lines = content.splitlines()
    for i in range(len(lines)):
        lines[i] = addanylabda(addletany(addany(lines[i])))
    with open(path, "wb") as f:
        content = f.write("\n".join(lines).encode("UTF-8"))
