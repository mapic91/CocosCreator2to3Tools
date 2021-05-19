import os
import ntpath
import re
import Config


def find_file(rootpath, filename):
    """
    :param rootpath:root dir to fild
    :param filename:which filename to find
    :return: a list of finded files path with filename
    """
    out = []
    for (dirpath, dirnames, filenames) in os.walk(rootpath):
        if filename in filenames:
            out.append(os.path.join(dirpath, filename))
    return out


def find_file_with_ext(rootpath, ext):
    return find_file_reg(rootpath, r".*\." + ext + "$", re.IGNORECASE)


def find_file_reg(rootpath, filename_pattern, flag):
    """
    find file use regular expression
    :param flag:
    :param rootpath:
    :param filename_pattern:
    :return:
    """
    out = []
    for (dirpath, dirnames, filenames) in os.walk(rootpath):
        for filename in filenames:
            if re.match(filename_pattern, filename, flag):
                out.append(os.path.join(dirpath, filename))
    return out


def find_code_file(rootpath):
    out1 = find_file_with_ext(rootpath, "h")
    out2 = find_file_with_ext(rootpath, "m")
    return out1 + out2


def find_image_file(rootpath):
    out1 = find_file_with_ext(rootpath, "png")
    out2 = find_file_with_ext(rootpath, "jpg")
    return out1 + out2


def rename_file(oldpath, newfilename):
    """
    /a/c/d    e  -> /a/c/e
    """
    head, tail = ntpath.split(oldpath)
    os.rename(oldpath, ntpath.join(head, newfilename))


def buff_all_file(files):
    """
    {
    filepath: ["line","line",...],
    filepath2: ["line","line",...]，
    ...
    }
    :param files:
    :return:
    """
    buff = {}
    for file in files:
        with open(file, "rb") as f:
            content = f.read().decode("UTF-8")
        buff[file] = content.splitlines()
    return buff


def flush_file_buff(buff):
    for path in buff:
        content = "\n".join(buff[path])
        with open(path, "wb") as f:
            f.write(content.encode("UTF-8"))


def remove_code_comment(lines):
    inblock = False
    insring = False
    out = []
    for line in lines:
        o = ""
        i = 0
        c = len(line)
        if c == 0:
            continue
        while True:
            if insring:
                if line[i] == '"' and line[i-1] != "\\":
                    insring = False
                o += line[i]
            elif inblock:
                if line[i] == "*" and i < c - 1 and line[i+1] == "/":
                    inblock = False
                    i += 1
            else:
                if line[i] == "/" and i < c - 1 and line[i+1] == "/":
                    break
                elif line[i] == "/" and i < c - 1 and line[i+1] == "*":
                    inblock = True
                    i += 1
                elif line[i] == '"':
                    insring = True
                    o += line[i]
                else:
                    o += line[i]
            i += 1
            if i >= c:
                break
        out.append(o)
    return out


def to_one_line(lines):
    return Config.LINE_SEP.join(lines)


def splite_lines(one_line):
    return one_line.split(Config.LINE_SEP)


def replace_in_word_bound(old_patton, new, text):
    if len(text) == 0:
        return ""
    words = []
    start = 0
    is_word = None
    for i in range(0, len(text)):
        if not text[i].isalpha() and not text[i].isdigit() and text[i] != "_":
            if i == 0:
                is_word = False
            else:
                if is_word:
                    words.append(text[start:i])
                    start = i
                    is_word = False
        else:
            if i == 0:
                is_word = True
            else:
                if not is_word:
                    words.append(text[start:i])
                    start = i
                    is_word = True
    words.append(text[start:])
    for i in range(0, len(words)):
        words[i] = old_patton == words[i] and new or words[i]
    return "".join(words)


def replace_in_files_buff(buff, old_patton, new, in_word_bound=True):
    for key in buff:
        contents = buff[key]
        for i in range(0, len(contents)):
            if in_word_bound:
                contents[i] = replace_in_word_bound(old_patton, new, contents[i])
            else:
                contents[i] = re.sub(old_patton, new, contents[i])


def replace_in_files_buff_skip_string(buff, old_patton, new, test_func, in_word_bound=True):
    """
    replace old_patton in files buff, but don't touch literal string code
    :param in_word_bound:
    :param buff:
    :param old_patton:
    :param new:
    :return:
    """
    for key in buff:
        contents = buff[key]
        for i in range(0, len(contents)):
            if not test_func(i, contents, old_patton):
                continue
            line = contents[i]
            sep = []
            beg = 0
            start = None
            for j in range(0, len(line)):
                if line[j] == '"':
                    if j > 0 and line[j-1] == "\\":  # "abc\"ddd"
                        continue
                    if j > 0 and j + 1 < len(line) and line[j-1] == "'" and line[j+1] == "'":  # '"'
                        continue
                    if start is None:
                        start = j
                        if beg != j:
                            if in_word_bound:
                                sep.append(replace_in_word_bound(old_patton, new, line[beg:start]))
                            else:
                                sep.append(re.sub(old_patton, new, line[beg:start]))
                    else:
                        sep.append(line[start:j+1])
                        beg = j+1
                        start = None
            if beg == 0:
                if in_word_bound:
                    contents[i] = replace_in_word_bound(old_patton, new, line)
                else:
                    contents[i] = re.sub(old_patton, new, line)
            else:
                if beg != len(line):
                    if in_word_bound:
                        sep.append(replace_in_word_bound(old_patton, new, line[beg:]))
                    else:
                        sep.append(re.sub(old_patton, new, line[beg:]))
                contents[i] = "".join(sep)


def replace_method_in_files_buff(buff, org_method, confuse_to):
    for key in buff:
        contents = buff[key]

        if len(org_method) == 1:
            pattan = r"([-+])\s*\(([a-zA-Z^_*\s]+)\)\s*"
            pattan += org_method[0]
            pattan += r"([^a-zA-Z0-9_])"
            rep = r"\1(\2)"
            rep += confuse_to[0]
            rep += r"\3"
            contents = re.sub(pattan, rep, contents)
        else:
            pattan = r"([-+])\s*\(([a-zA-Z^_*\s]+)\)\s*"
            for i in range(0, len(org_method)):
                if i > 0:
                    pattan += r"([^:]+?)"
                pattan += org_method[i]
                pattan += r"\s*"
                if i != len(org_method) - 1:
                    pattan += ":"
            rep = r"\1(\2)"
            for i in range(0, len(confuse_to)):
                rep += confuse_to[i]
                if i != len(confuse_to) - 1:
                    rep += ":\\" + str(3 + i)
            contents = re.sub(pattan, rep, contents)

        if len(org_method) == 1:
            pattan = r"\[(.+?)"
            pattan += org_method[0]
            pattan += r"\s*\]"
            rep = r"[\1"
            rep += confuse_to[0]
            rep += r"]"
            contents = re.sub(pattan, rep, contents)
            pattan = r"\[(.+?)"
            pattan += org_method[0]
            pattan += r"\s*:(.+?)]"
            rep = r"[\1"
            rep += confuse_to[0]
            rep += r":\2]"
            contents = re.sub(pattan, rep, contents)
            pattan = r"@selector\(\s*"
            pattan += org_method[0]
            pattan += r"\s*\)"
            rep = r"@selector(" + confuse_to[0] + r")"
            contents = re.sub(pattan, rep, contents)
            pattan = r"@selector\(\s*"
            pattan += org_method[0]
            pattan += r"\s*:\s*\)"
            rep = r"@selector(" + confuse_to[0] + r":)"
            contents = re.sub(pattan, rep, contents)
        else:
            pattan = r"\[(.+?)"
            for i in range(0, len(org_method)):
                if i > 0:
                    pattan += r"(.+?)"
                pattan += org_method[i]
                pattan += r"\s*"
                if i != len(org_method) - 1:
                    pattan += ":"
            pattan += r"(.*?)\]"
            rep = r"[\1"
            for i in range(0, len(confuse_to)):
                rep += confuse_to[i]
                if i != len(confuse_to) - 1:
                    rep += ":\\" + str(2 + i)
            rep += "\\" + str(len(confuse_to) == 1 and 2 or len(confuse_to) + 1) + "]"
            contents = re.sub(pattan, rep, contents)
            pattan = r"@selector\(\s*"
            for m in org_method:
                pattan += (m + r"\s*:\s*")
            pattan += r"\s*\)"
            rep = r"@selector("
            for n in confuse_to:
                rep += (n + ":")
            rep += r")"
            contents = re.sub(pattan, rep, contents)
        buff[key] = contents


if __name__ == '__main__':
    assert os.path.join(os.getcwd(), "FileUtils.py") in find_file(os.getcwd(), "FileUtils.py")
    assert os.path.join(os.getcwd(), "FileUtils.py") in find_file_reg(os.getcwd(), r".*\.py$")
    assert os.path.join(os.getcwd(), "FileUtils.py") in find_file_with_ext(os.getcwd(), "py")
    print(buff_all_file(["FileUtils.py"]))
    print(remove_code_comment(["ab//cde", 'dd"//ddd"', "c/*abc", "*/123"]))
