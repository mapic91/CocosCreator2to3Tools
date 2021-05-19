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
    files = find_file_with_ext(r"D:\marketclt\trunk\jingying_trunk_3\assets\resources\cdnRes", "prefab")
    scenes = find_file_with_ext(r"D:\marketclt\trunk\jingying_trunk_3\assets\scene", "scene")
    for file in (files + scenes):
        with open(file, "rb") as f:
            content = f.read().decode("UTF-8")
        obj = json.loads(content)
        changed = False
        for d in obj:
            if d.get("_lscale") is not None and d.get("_lscale").get("z") == 0:
                d.get("_lscale")["z"] = 1
                changed = True
        if changed:
            with open(file, "w") as f:
                json.dump(obj, f, ensure_ascii=True, indent=2)


# See PyCharm help at https://www.jetbrains.com/help/pycharm/
