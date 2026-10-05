import { describe, expect, it } from "vitest";

import { negrita } from "@/test/alfabetos";

import { CORTES, gancho } from "./gancho";

describe("gancho", () => {
  it("un texto corto se ve entero y no lleva «…más»", () => {
    expect(gancho("Hola, LinkedIn.", "escritorio")).toEqual({ visible: "Hola, LinkedIn.", recortado: false });
    expect(gancho("", "movil")).toEqual({ visible: "", recortado: false });
  });

  it("corta a 210 caracteres en escritorio y a 140 en móvil", () => {
    const texto = "a".repeat(300);
    expect(gancho(texto, "escritorio")).toEqual({ visible: "a".repeat(210), recortado: true });
    expect(gancho(texto, "movil")).toEqual({ visible: "a".repeat(140), recortado: true });
  });

  it("un texto justo en el límite no se recorta", () => {
    const texto = "a".repeat(CORTES.movil.caracteres);
    expect(gancho(texto, "movil")).toEqual({ visible: texto, recortado: false });
  });

  it("las letras con formato cuentan dos, así que se ve menos texto", () => {
    const texto = negrita("a").repeat(150);
    expect(gancho(texto, "escritorio").visible).toBe(negrita("a").repeat(105));
    expect(gancho(texto, "movil").visible).toBe(negrita("a").repeat(70));
  });

  it("no parte un carácter de dos unidades ni separa una letra de su tilde", () => {
    const texto = `${"a".repeat(139)}👍x`;
    expect(gancho(texto, "movil").visible).toBe("a".repeat(139));
    const conTilde = `${"a".repeat(139)}${negrita("o")}́x`;
    expect(gancho(conTilde, "movil").visible).toBe("a".repeat(139));
  });

  it("corta por líneas si llegan antes: 5 en escritorio y 3 en móvil", () => {
    const texto = "uno\ndos\ntres\ncuatro\ncinco\nseis\nsiete";
    expect(gancho(texto, "escritorio")).toEqual({ visible: "uno\ndos\ntres\ncuatro\ncinco", recortado: true });
    expect(gancho(texto, "movil")).toEqual({ visible: "uno\ndos\ntres", recortado: true });
  });

  it("las líneas en blanco también cuentan como líneas", () => {
    expect(gancho("uno\n\ndos\n\ntres", "movil")).toEqual({ visible: "uno\n\ndos", recortado: true });
  });

  it("no deja espacios ni saltos colgando al final de lo visible", () => {
    expect(gancho("hola   \n\n\n\n\n\nadiós", "escritorio").visible).toBe("hola");
  });

  it("lo que queda detrás solo cuenta si tiene algo que leer", () => {
    expect(gancho("uno\ndos\ntres\n\n   ", "movil")).toEqual({ visible: "uno\ndos\ntres", recortado: false });
  });
});
