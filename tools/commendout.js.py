import json
import re
import os


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


if __name__ == '__main__':
    files = find_file_with_ext(r"D:\marketclt\trunk\jingying_trunk_3\assets\scripts\scenes", "ts")
    for file in files:
        with open(file, "rb") as f:
            content = f.read().decode("UTF-8")
        lines = content.splitlines()
        lines = ["//" + line for line in lines]
        content = "\n".join(lines)
        with open(file, "wb") as f:
            f.write(content.encode("UTF-8"))
